import { VITE_LOCALE } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		// This only works in SSR, when the HTML is sent to the client.
		// If the language can be changed using client-side navigation,
		// `<html lang>` should be updated using client-side JavaScript.
		transformPageChunk: ({ html }) => html.replace('%lang%', VITE_LOCALE)
	});

	return response;
};
