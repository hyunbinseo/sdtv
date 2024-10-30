import { dateToSafeISOString } from '@hyunbinseo/tools';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { env } from 'node:process';
import * as schema from '../src/lib/server/database/schema.js';

if (!env.SQLITE_PATH) throw new TypeError('SQLITE_PATH is undefined');

const db = drizzle({
	connection: { source: env.SQLITE_PATH },
	casing: 'snake_case',
	schema
});

const path = import.meta.dirname + '/backups';
mkdirSync(path, { recursive: true });
await db.$client.backup(path + `/${dateToSafeISOString()}.sqlite`);
