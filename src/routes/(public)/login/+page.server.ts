import { dev } from '$app/environment';
import { EMAIL_FROM, EMAIL_TOKEN, MASTER_CONTACT } from '$env/static/private';
import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { authenticate } from '$lib/server/authenticate.ts';
import { db } from '$lib/server/database/client.ts';
import { loginOtpLength } from '$lib/server/database/config.ts';
import { loginTable, roleTable, userTable } from '$lib/server/database/schema.ts';
import { pickTableColumns } from '$lib/server/database/utilities.ts';
import { parseOrErrorPage } from '$lib/utilities.ts';
import { formDataToObject } from '@hyunbinseo/tools';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { PostmarkSendEmail as sendEmail } from 'new-request';
import { digits, email, length, object, pipe, string, trim, ulid, uuid } from 'valibot';
import type { PageServerLoad } from './$types.ts';
import { t } from './i18n.ts';

// Cannot prerender pages with actions. Magic link will result in a 500 server error.
// Reference https://kit.svelte.dev/docs/page-options#prerender-when-not-to-prerender
export const prerender = false;

export const load = (async ({ locals, url }) => {
	if (locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

	if (!url.searchParams.has('code')) return { pageTitle: t.pageTitle, loginOtpLength };

	const searchParams = parseOrErrorPage(
		object({
			id: pipe(string(), ulid()),
			code: pipe(string(), uuid())
		}),
		{
			id: url.searchParams.get('id'),
			code: url.searchParams.get('code')
		}
	);

	const magicLinkLogin = await db.query.loginTable.findFirst({
		columns: { id: true, code: true },
		where: and(
			eq(loginTable.id, searchParams.id),
			eq(loginTable.code, searchParams.code),
			gt(loginTable.expiresAt, new Date()),
			isNull(loginTable.expiredAt)
		),
		with: { user: { columns: { contact: true } } }
	});

	return {
		pageTitle: t.pageTitle,
		loginOtpLength,
		magicLinkLogin: magicLinkLogin || null
	};
}) satisfies PageServerLoad;

export const actions = {
	send: async ({ fetch, getClientAddress, locals, request, url }) => {
		if (locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await request.formData();

		const contact = parseOrErrorPage(
			pipe(string(), trim(), email()), //
			formData.get('contact')
		);

		const existingUser = await db.query.userTable.findFirst({
			columns: { id: true },
			orderBy: desc(userTable.id),
			where: and(
				eq(userTable.contact, contact), //
				isNull(userTable.deactivatedAt)
			),
			with: {
				logins: {
					columns: { id: true },
					where: and(
						gt(loginTable.expiresAt, new Date()), //
						isNull(loginTable.expiredAt)
					)
				}
			}
		});

		if (existingUser?.logins.length && !dev)
			return fail(400, { error: 'ACTIVE_MAGIC_LINK_EXISTS' as const });

		const user =
			existingUser ||
			(
				await db
					.insert(userTable) //
					.values({ contact })
					.returning(pickTableColumns(userTable, ['id']))
			)[0];

		if (!existingUser && contact === MASTER_CONTACT)
			await db.insert(roleTable).values({
				userId: user.id,
				role: 'superuser',
				assignedBy: user.id
			});

		const [login] = await db
			.insert(loginTable) //
			.values({ userId: user.id, ip: getClientAddress() })
			.returning(pickTableColumns(loginTable, ['id', 'code', 'otp']));

		const magicLink = new URL(url);
		magicLink.search = '';
		magicLink.searchParams.set('id', login.id);
		magicLink.searchParams.set('code', login.code);

		if (dev)
			// eslint-disable-next-line no-console
			console.table({
				Contact: contact,
				MagicLink: magicLink.toString(),
				OTP: login.otp
			});

		if (!dev) {
			const response = await sendEmail(
				{ To: contact, ...t.template(magicLink, login.otp) },
				{ from: EMAIL_FROM, serverToken: EMAIL_TOKEN, fetch }
			);

			if (response instanceof Error || !response.ok) {
				await db
					.update(loginTable)
					.set({ expiredAt: new Date() })
					.where(eq(loginTable.id, login.id));

				return fail(400, { error: 'MAGIC_LINK_SEND_FAILED' as const });
			}
		}

		return { loginId: login.id };
	},
	magic: async (e) => {
		if (e.locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await e.request.formData();

		const form = parseOrErrorPage(
			object({
				id: pipe(string(), ulid()),
				code: pipe(string(), uuid())
			}),
			formDataToObject(formData, { get: ['id', 'code'] })
		);

		const magicLinkLogin = (
			await db
				.update(loginTable)
				.set({ expiredAt: new Date() })
				.where(
					and(
						eq(loginTable.id, form.id), //
						isNull(loginTable.expiredAt)
					)
				)
				.returning(pickTableColumns(loginTable, ['id', 'userId', 'code', 'expiresAt']))
		).at(0);

		if (!magicLinkLogin || magicLinkLogin.code !== form.code) error(400);

		if (magicLinkLogin.expiresAt < new Date())
			return fail(400, { error: 'LOGIN_EXPIRED' as const });

		await authenticate(e, magicLinkLogin.userId, magicLinkLogin.id);
	},
	otp: async (e) => {
		if (e.locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await e.request.formData();

		const form = parseOrErrorPage(
			object({
				id: pipe(string(), ulid()),
				otp: pipe(string(), digits(), length(loginOtpLength))
			}),
			formDataToObject(formData, { get: ['id', 'otp'] })
		);

		const otpLogin = (
			await db
				.update(loginTable)
				.set({ expiredAt: new Date() })
				.where(
					and(
						eq(loginTable.id, form.id), //
						isNull(loginTable.expiredAt)
					)
				)
				.returning(pickTableColumns(loginTable, ['id', 'userId', 'otp', 'expiresAt']))
		).at(0);

		if (!otpLogin) error(400);
		if (otpLogin.otp !== form.otp) return fail(400, { error: 'INCORRECT_OTP' as const });
		if (otpLogin.expiresAt < new Date()) return fail(400, { error: 'LOGIN_EXPIRED' as const });

		await authenticate(e, otpLogin.userId, otpLogin.id);
	}
};
