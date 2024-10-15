import { toReadonly } from '@hyunbinseo/tools';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { userTable } from './user.ts';

export type Role = (typeof Roles)[number];
export const Roles = ['admin', 'superuser'] as const;
export const roles = toReadonly(new Set(Roles));

export const roleTable = sqliteTable('role', {
	id: text().primaryKey().$default(ulid),
	userId: text()
		.notNull()
		.references(() => userTable.id),
	role: text({ enum: Roles }).notNull(),
	assignedAt: integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
	assignedBy: text()
		.notNull()
		.references(() => userTable.id),
	revokedAt: integer({ mode: 'timestamp' }),
	revokedBy: text().references(() => userTable.id)
});
