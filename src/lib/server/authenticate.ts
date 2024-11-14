import { dev } from '$app/environment';
import { JWT_SECRET, SESSION_COOKIE_NAME } from '$env/static/private';
import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { base64ToUint8Array } from '$lib/utilities.ts';
import { toReadonly } from '@hyunbinseo/tools';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { eq, isNull } from 'drizzle-orm';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { db } from './database/client.ts';
import { roleTable, sessionTable, userTable, type Role } from './database/schema.ts';
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
