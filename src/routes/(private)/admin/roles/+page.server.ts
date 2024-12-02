import { db } from '$lib/server/database/client.ts';
import {
	profileTable,
	Roles,
	roleTable,
	userTable,
	type Role
} from '$lib/server/database/schema.ts';
import { pickTableColumns } from '$lib/server/database/utilities.ts';
import { parseOrErrorPage } from '$lib/utilities.ts';
import { error } from '@sveltejs/kit';
import { and, count, eq, isNull, not, sql } from 'drizzle-orm';
import { minLength, notValue, picklist, pipe, string, trim, ulid } from 'valibot';
import { banUserSessions } from '../index.server.ts';
import type { PageServerLoad } from './$types.js';
import { t } from './i18n.ts';

export const load = (async ({ depends, locals }) => {
	depends('admin:roles');

	if (!locals.session?.roles.has('superuser')) error(403);

	const users = await db
		.select({
			...pickTableColumns(userTable, ['id', 'contact']),
			profile: pickTableColumns(profileTable, ['surname', 'givenName']),
			roles: sql`GROUP_CONCAT(DISTINCT ${roleTable.role})`.mapWith(
				(v: string) => new Set(v.split(',')) as ReadonlySet<Role>
			)
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
				not(eq(userTable.id, locals.session.userId))
			)
		);

	return { pageTitle: t.pageTitle, users };
}) satisfies PageServerLoad;

export const actions = {
	search: async ({ locals, request }) => {
		if (!locals.session?.roles.has('superuser')) error(403);

		const formData = await request.formData();

		const givenNameKeyword = parseOrErrorPage(
			pipe(string(), trim(), minLength(1)),
			formData.get('given-name')
		);

		const users = await db
			.select({
				...pickTableColumns(userTable, ['id', 'contact']),
				profile: pickTableColumns(profileTable, ['surname', 'givenName'])
			})
			.from(userTable)
			.innerJoin(profileTable, eq(profileTable.userId, userTable.id))
			.leftJoin(
				roleTable,
				and(
					eq(roleTable.userId, userTable.id), //
					isNull(roleTable.revokedAt)
				)
			)
			.groupBy(userTable.id)
			.having(eq(count(roleTable.id), 0))
			.where(
				and(
					sql`${profileTable.givenName} LIKE ${`%${givenNameKeyword}%`} COLLATE NOCASE`,
					isNull(userTable.deactivatedAt),
					not(eq(userTable.id, locals.session.userId))
				)
			);

		return { users };
	},
	assign: async (e) => {
		if (!e.locals.session?.roles.has('superuser')) error(403);

		const formData = await e.request.formData();

		const userId = parseOrErrorPage(
			pipe(string(), ulid(), notValue(e.locals.session.userId)),
			formData.get('user-id')
		);

		const isNewUser = formData.has('role');

		const role = parseOrErrorPage(
			picklist(Roles), //
			isNewUser ? formData.get('role') : e.url.searchParams.get('role')
		);

		await db //
			.insert(roleTable)
			.values({ userId, role, assignedBy: e.locals.session.userId });

		await banUserSessions(e, e.locals.session, [userId]);

		if (isNewUser) return { userId };
	},
	revoke: async (e) => {
		if (!e.locals.session?.roles.has('superuser')) error(403);

		const formData = await e.request.formData();

		const userId = parseOrErrorPage(
			pipe(string(), ulid(), notValue(e.locals.session.userId)),
			formData.get('user-id')
		);

		const role = parseOrErrorPage(
			picklist(Roles), //
			e.url.searchParams.get('role')
		);

		await db
			.update(roleTable)
			.set({ revokedAt: new Date(), revokedBy: e.locals.session.userId })
			.where(
				and(
					eq(roleTable.userId, userId), //
					eq(roleTable.role, role),
					isNull(roleTable.revokedAt)
				)
			);

		await banUserSessions(e, e.locals.session, [userId]);
	}
};
