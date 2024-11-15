import { dev } from '$app/environment';
import { JWT_SECRET, SESSION_COOKIE_NAME } from '$env/static/private';
import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { base64ToUint8Array } from '$lib/utilities.ts';
import { toReadonly } from '@hyunbinseo/tools';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { and, eq, gt, isNull, lt, ne, sql } from 'drizzle-orm';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { db } from './database/client.ts';
import {
	roleTable,
	sessionBanTable,
	sessionTable,
	userTable,
	type Role
} from './database/schema.ts';
import { pickTableColumns } from './database/utilities.ts';

const jwtSecret = base64ToUint8Array(JWT_SECRET);

type Payload = {
	profile?: null;
	roles: Array<Role>;
} & Required<Pick<JWTPayload, 'iat' | 'exp' | 'jti' | 'sub'>>;

export const authenticate = async (e: RequestEvent, userId: string, loginId: string | null) => {
	if (!loginId && e.locals.session) error(500); // renewal

	const user = await db.query.userTable.findFirst({
		columns: { id: true },
		where: eq(userTable.id, userId),
		with: {
			profile: { columns: { userId: true } },
			roles: {
				columns: { role: true },
				where: isNull(roleTable.revokedAt)
			}
		}
	});

	if (!user) error(500);

	// The RETURNING clause can only return data to the application.
	// It is not currently possible to divert the RETURNING output into another table or query.
	// Reference https://sqlite.org/lang_returning.html#limitations_and_caveats
	// Reference https://sqlite.org/forum/info/b412619373cdd1b5

	const [session] = await db
		.insert(sessionTable)
		.values({ userId, loginId, ip: e.getClientAddress() })
		.returning(pickTableColumns(sessionTable, ['id', 'issuedAt', 'expiresAt']));

	const jwt = await new SignJWT({
		jti: session.id,
		sub: userId,
		profile: !user.profile ? null : undefined,
		roles: [...new Set(user.roles.map(({ role }) => role))]
	} satisfies Omit<Payload, 'iat' | 'exp'>)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt(session.issuedAt)
		.setExpirationTime(session.expiresAt)
		.sign(jwtSecret);

	e.cookies.set(SESSION_COOKIE_NAME, jwt, {
		path: '/',
		expires: session.expiresAt,
		// Enable `Set-Cookie` in Vite dev server environments. (e.g. --host, SSL)
		// Blocked by https://github.com/sveltejs/kit/issues/10438#issue-1822614710
		secure: !dev || e.url.protocol === 'https:'
	});

	const { payload } = await jwtVerify<Payload>(jwt, jwtSecret);
	e.locals.session = payloadToSession(payload);

	redirect(302, PUBLIC_PRIVATE_PATH);
};

const payloadToSession = (payload: Payload): NonNullable<App.Locals['session']> => {
	const roles = toReadonly(new Set(payload.roles));
	return {
		id: payload.jti,
		userId: payload.sub,
		expiresAt: new Date(payload.exp * 1000),
		roles,
		isAdmin: roles.has('admin') || roles.has('superuser'),
		profile: payload.profile !== null
	};
};

export const validateSession = async (e: RequestEvent) => {
	const jwt = e.cookies.get(SESSION_COOKIE_NAME);
	if (!jwt) return;

	try {
		// Errors can be thrown. (e.g. JWTClaimValidationFailed, JWTExpired, JWTInvalid)
		// Reference https://github.com/panva/jose/blob/main/docs/modules/util_errors.md
		const { payload } = await jwtVerify<Payload>(jwt, jwtSecret);

		const sessionBan = await db.query.sessionBanTable.findFirst({
			columns: { sessionId: true },
			where: and(
				eq(sessionBanTable.sessionId, payload.jti),
				lt(sessionBanTable.bannedAt, new Date())
			)
		});

		if (sessionBan) throw new Error();

		e.locals.session = payloadToSession(payload);
	} catch {
		e.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		e.locals.session = undefined;
	}
};

export const banCurrentSession = async (
	e: RequestEvent,
	options?: Partial<{ all: true; delay: true }>
) => {
	if (!e.locals.session) return;

	const { id: sessionId, userId } = e.locals.session;
	const ip = e.getClientAddress();

	await db
		.insert(sessionBanTable)
		.values([
			// Inserting this row can be done using the UNION set operation.
			// Reference https://orm.drizzle.team/docs/set-operations#union
			{
				sessionId,
				bannedAt: options?.delay ? new Date(Date.now() + 10 * 1000) : undefined,
				bannedBy: userId,
				ip
			},
			...(!options?.all
				? []
				: // `INSERT INTO table SELECT ...` is not supported yet.
					// This could possibly become a prepared query with a CTE.
					// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/398
					await db
						.select({
							sessionId: sessionTable.id,
							bannedBy: sql<string>`${userId}`,
							ip: sql<string>`${ip}`
						})
						.from(sessionTable)
						.where(
							and(
								ne(sessionTable.id, sessionId),
								eq(sessionTable.userId, userId),
								gt(sessionTable.expiresAt, new Date())
							)
						))
		])
		.onConflictDoNothing();

	e.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	e.locals.session = undefined;
};
