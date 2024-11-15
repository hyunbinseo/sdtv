import { banCurrentSession } from '$lib/server/authenticate.ts';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (e) => {
		await banCurrentSession(e);
		redirect(302, '/');
	}
};
