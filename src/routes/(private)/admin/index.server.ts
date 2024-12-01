import { db } from '$lib/server/database/client.ts';
import { sessionBanTable, sessionTable } from '$lib/server/database/schema.ts';
import { type RequestEvent } from '@sveltejs/kit';
import { and, gt, inArray, sql } from 'drizzle-orm';

export const banUserSessions = async (e: RequestEvent, userIds: string[]) => {
	if (!e.locals.session?.roles.has('superuser')) return;
	if (userIds.includes(e.locals.session.userId)) return;

	await db
		.insert(sessionBanTable)
		.select(
			db
				.select({
					sessionId: sessionTable.id,
					bannedAt: sql`strftime('%s', 'now')`.as('banned_at'),
					bannedBy: sql`${e.locals.session.userId}`.as('banned_by'),
					ip: sql`${e.getClientAddress()}`.as('ip')
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
