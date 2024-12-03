import { db } from '$lib/server/database/client.ts';
import { sessionBanTable, sessionTable } from '$lib/server/database/schema.ts';
import { sqlUnixEpoch } from '$lib/server/database/sql.ts';
import { type RequestEvent } from '@sveltejs/kit';
import { and, gt, inArray, sql } from 'drizzle-orm';

type Session = NonNullable<App.Locals['session']>;

// Convert this into a prepared statement.
// Remove aliases in the `INSERT INTO table SELECT ...;` statement.
// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/3656

export const banUserSessions = (e: RequestEvent, session: Session, userIds: string[]) =>
	db
		.insert(sessionBanTable)
		.select(
			db
				.select({
					sessionId: sessionTable.id,
					bannedAt: sqlUnixEpoch.as('banned_at'),
					bannedBy: sql`${session.userId}`.as('banned_by'),
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
