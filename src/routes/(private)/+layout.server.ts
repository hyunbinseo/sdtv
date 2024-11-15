import { PUBLIC_ONBOARD_PATH } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export const load = ({ depends, locals, url }) => {
	depends('private:session');
	if (!locals.session) redirect(302, '/login');
	if (!locals.session.profile && url.pathname !== PUBLIC_ONBOARD_PATH)
		redirect(302, PUBLIC_ONBOARD_PATH);
	return {
		session: {
			expiresAt: locals.session.expiresAt.valueOf(),
			isAdmin: locals.session.isAdmin,
			isSuperuser: locals.session.roles.has('superuser')
		}
	};
};
