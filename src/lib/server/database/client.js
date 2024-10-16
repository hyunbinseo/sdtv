import { dev } from '$app/environment';
import { SQLITE_PATH } from '$env/static/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

// The `SQLITE_PATH` variable differs in `dev`, `build`, and `preview`,
// because Vite imports different `.env` files according to the mode.
// Reference https://vitejs.dev/guide/env-and-mode#env-files
// Reference https://vitejs.dev/guide/env-and-mode#modes

export const db = drizzle({
	connection: { source: SQLITE_PATH },
	casing: 'snake_case',
	schema
});

// It's recommended to turn on WAL mode to greatly increase overall performance.
// Reference https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md

if (!dev) db.$client.pragma('journal_mode = WAL');
