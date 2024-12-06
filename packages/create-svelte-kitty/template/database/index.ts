import { and, asc, desc, eq, gt, inArray, isNull, lt, ne, notExists, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { Console } from 'node:console';
import { appendFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { Transform } from 'node:stream';
import { object, parse, string } from 'valibot';
import * as schema from '../src/lib/server/database/schema.ts';
import {
	loginTable,
	profileTable,
	roleTable,
	sessionBanTable,
	sessionTable,
	userTable
} from '../src/lib/server/database/schema.ts';
import { pickTableColumns } from '../src/lib/server/database/utilities.ts';

loadEnvFile('.env.development');

const env = parse(object({ SQLITE_PATH: string() }), process.env);

const db = drizzle({
	connection: { source: env.SQLITE_PATH },
	casing: 'snake_case',
	schema
});

const queries = [
	db.query.userTable.findFirst({
		columns: { id: true },
		where: eq(userTable.id, ''),
		with: {
			profile: { columns: { userId: true } },
			roles: {
				columns: { role: true },
				where: isNull(roleTable.revokedAt)
			}
		}
	}),
	db.query.sessionBanTable.findFirst({
		columns: { sessionId: true },
		where: and(eq(sessionBanTable.sessionId, ''), lt(sessionBanTable.bannedAt, sql`1700000000`))
	}),
	db
		.select({
			sessionId: sessionTable.id,
			bannedAt: sql`1700000000`,
			bannedBy: sql`''`,
			ip: sql`''`
		})
		.from(sessionTable)
		.where(
			and(
				ne(sessionTable.id, ''),
				eq(sessionTable.userId, ''),
				gt(sessionTable.expiresAt, sql`1700000000`)
			)
		),
	db
		.select({
			sessionId: sessionTable.id,
			bannedAt: sql`1700000000`.as('banned_at'),
			bannedBy: sql`''`.as('banned_by'),
			ip: sql`''`.as('ip')
		})
		.from(sessionTable)
		.where(
			and(
				inArray(sessionTable.userId, ['']), //
				gt(sessionTable.expiresAt, sql`1700000000`)
			)
		),
	db
		.select({
			...pickTableColumns(userTable, ['id', 'contact']),
			profile: pickTableColumns(profileTable, ['surname', 'givenName']),
			roles: sql`GROUP_CONCAT(DISTINCT ${roleTable.role})`
		})
		.from(userTable)
		.innerJoin(profileTable, eq(profileTable.userId, userTable.id))
		.innerJoin(
			roleTable,
			and(
				eq(roleTable.userId, userTable.id), //
				isNull(roleTable.revokedAt)
			)
		)
		.groupBy(userTable.id)
		.where(
			and(
				isNull(userTable.deactivatedAt), //
				ne(userTable.id, '')
			)
		),
	db
		.select({
			...pickTableColumns(userTable, ['id', 'contact']),
			profile: pickTableColumns(profileTable, ['surname', 'givenName'])
		})
		.from(userTable)
		.innerJoin(profileTable, eq(profileTable.userId, userTable.id))
		.leftJoin(roleTable, eq(roleTable.userId, userTable.id))
		.groupBy(userTable.id)
		.where(
			and(
				notExists(
					db
						.select()
						.from(roleTable)
						.where(
							and(
								eq(roleTable.userId, userTable.id), //
								isNull(roleTable.revokedAt)
							)
						)
				),
				// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/638
				sql`${profileTable.givenName} LIKE ${`%${'string'}%`} COLLATE NOCASE`,
				isNull(userTable.deactivatedAt),
				ne(userTable.id, '')
			)
		),
	db
		.update(roleTable)
		.set({
			revokedAt: sql`1700000000`,
			revokedBy: ''
		})
		.where(
			and(
				eq(roleTable.userId, ''), //
				eq(roleTable.role, sql`'admin'`),
				isNull(roleTable.revokedAt)
			)
		),
	db
		.select({
			...pickTableColumns(userTable, ['id', 'contact']),
			deactivatedAt: userTable.deactivatedAt,
			profile: pickTableColumns(profileTable, ['givenName', 'surname'])
		})
		.from(userTable)
		.leftJoin(profileTable, eq(profileTable.userId, userTable.id))
		.where(and(isNull(userTable.deactivatedAt), ne(userTable.id, '')))
		.orderBy(
			desc(userTable.deactivatedAt),
			// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/1699
			sql`${profileTable.givenName} ASC NULLS LAST`,
			asc(profileTable.surname)
		),
	db
		.update(userTable)
		.set({
			deactivatedAt: sql`1700000000`,
			deactivatedBy: ''
		})
		.where(
			and(
				inArray(userTable.id, []), //
				isNull(userTable.deactivatedAt)
			)
		),
	db.query.loginTable.findFirst({
		columns: { id: true, code: true },
		where: and(
			eq(loginTable.id, ''),
			eq(loginTable.code, ''),
			gt(loginTable.expiresAt, sql`1700000000`),
			isNull(loginTable.expiredAt)
		),
		with: { user: { columns: { contact: true } } }
	}),
	db.query.userTable.findFirst({
		columns: { id: true },
		orderBy: desc(userTable.id),
		where: and(
			eq(userTable.contact, ''), //
			isNull(userTable.deactivatedAt)
		),
		with: {
			logins: {
				columns: { id: true },
				where: and(
					gt(loginTable.expiresAt, sql`1700000000`), //
					isNull(loginTable.expiredAt)
				)
			}
		}
	}),
	db
		.update(loginTable)
		.set({ expiredAt: sql`1700000000` })
		.where(eq(loginTable.id, '')),
	db
		.update(loginTable)
		.set({ expiredAt: sql`1700000000` })
		.where(
			and(
				eq(loginTable.id, ''), //
				isNull(loginTable.expiredAt)
			)
		)
		.returning(pickTableColumns(loginTable, ['id', 'userId', 'code', 'expiresAt'])),
	db
		.update(loginTable)
		.set({ expiredAt: sql`1700000000` })
		.where(
			and(
				eq(loginTable.id, ''), //
				isNull(loginTable.expiredAt)
			)
		)
		.returning(pickTableColumns(loginTable, ['id', 'userId', 'otp', 'expiresAt']))
];

// Reference https://stackoverflow.com/a/67859384/12817553
const objectToTable = (data: unknown[]) => {
	const ts = new Transform({
		transform(chunk, enc, cb) {
			cb(null, chunk);
		}
	});
	const logger = new Console({ stdout: ts });
	logger.table(data);
	return (ts.read() || '').toString();
};

queries.forEach((query, index) => {
	const { sql, params } = query.toSQL();
	const result = db.$client.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(params);
	appendFileSync(
		import.meta.dirname + '/plan.md',
		(!index ? '' : '\n') +
			`## ${index}\n\n` +
			'```sql\n' +
			sql +
			'\n```\n\n```\n' +
			objectToTable(result) +
			'```\n'
	);
});
