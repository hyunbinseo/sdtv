import { dev } from '$app/environment';
import { VITE_LOCALE } from '$env/static/private';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { SqliteError } from 'better-sqlite3';

export const handle: Handle = async ({ event, resolve }) => {
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

export const handleError: HandleServerError = ({ error }) => {
	if (dev && error instanceof Error) console.error(error);
	if (
		error instanceof SqliteError &&
		(error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE')
	) {
		// Randomly generated IDs can collide and cause constraint errors. (e.g. UUID, ULID)
		// Since the likelihood is extremely low, the INSERT retry logic is not implemented.
	}
};
