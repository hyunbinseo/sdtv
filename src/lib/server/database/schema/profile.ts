import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { userTable } from './user.ts';

export const profileTable = sqliteTable('profile', {
	userId: text()
		.primaryKey()
		.references(() => userTable.id),
	surname: text().notNull(),
	givenName: text().notNull(),
	createdAt: integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
	updatedAt: integer({ mode: 'timestamp' }).$onUpdate(() => new Date())
});
