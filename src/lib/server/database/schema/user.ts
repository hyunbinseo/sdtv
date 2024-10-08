import { integer, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';

const self = (): AnySQLiteColumn => userTable.id;

export const userTable = sqliteTable('user', {
	id: text().primaryKey().$default(ulid), // sub
	contact: text().notNull(),
	deactivatedAt: integer({ mode: 'timestamp' }),
	deactivatedBy: text().references(self)
});
