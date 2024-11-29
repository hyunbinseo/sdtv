import { db } from '$lib/server/database/client.ts';
import { sessionBanTable, sessionTable } from '$lib/server/database/schema.ts';
import { type RequestEvent } from '@sveltejs/kit';
import { and, gt, inArray, sql } from 'drizzle-orm';

export const banUserSessions = async (e: RequestEvent, userIds: string[]) => {
	if (!e.locals.session?.roles.has('superuser')) return;
	if (userIds.includes(e.locals.session.userId)) return;

	await db
		.insert(sessionBanTable)
		.values(
			// `INSERT INTO table SELECT ...` is not supported yet.
			// This could possibly become a prepared query with a CTE.
			// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/398
			await db
				.select({
					sessionId: sessionTable.id,
					bannedBy: sql<string>`${e.locals.session.userId}`,
					ip: sql<string>`${e.getClientAddress()}`
				})
				.from(sessionTable)
				.where(
					and(
						inArray(sessionTable.userId, userIds), //
						gt(sessionTable.expiresAt, new Date())
					)
				)
		)
		.onConflictDoNothing();
};
