import { VITE_LOCALE } from '$env/static/private';
import { validateSession } from '$lib/server/authenticate.ts';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	await validateSession(event);

	const response = await resolve(event, {
		// This only works in SSR, when the HTML is sent to the client.
		// If the language can be changed using client-side navigation,
		// `<html lang>` should be updated using client-side JavaScript.
		transformPageChunk: ({ html }) => html.replace('%lang%', VITE_LOCALE)
	});

	try {
		// Reference https://github.com/sveltejs/kit/issues/6790
		response.headers.delete('link');
	} catch {
		// Reference https://github.com/sveltejs/kit/issues/11883
	}

	return response;
};
