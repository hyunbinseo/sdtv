import { error } from '@sveltejs/kit';

export const load = ({ locals }) => {
	if (!locals.session?.isAdmin) error(403);
};
