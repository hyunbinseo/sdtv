import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { userIp } from '../columns.ts';
import { sessionExpiresIn } from '../config.js';
import { loginTable } from './login.ts';
import { userTable } from './user.ts';

export const sessionTable = sqliteTable('session', {
	id: text().primaryKey().$default(ulid), // jti
	userId: text()
		.notNull()
		.references(() => userTable.id),
	loginId: text().references(() => loginTable.id),
	issuedAt: integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
	expiresAt: integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date(Date.now() + sessionExpiresIn)),
	userIp
});
