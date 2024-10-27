import { dateToSafeISOString } from '@hyunbinseo/tools';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { copyFileSync, mkdirSync } from 'node:fs';
import { env, loadEnvFile } from 'node:process';
import * as schema from '../src/lib/server/database/schema.js';

loadEnvFile('.env.production');

if (!env.SQLITE_PATH) throw new TypeError('SQLITE_PATH is undefined');

const db = drizzle({
	connection: { source: env.SQLITE_PATH },
	casing: 'snake_case',
	schema
});

// Truncate WAL file to zero bytes before backup.
// Reference https://www.sqlite.org/pragma.html#pragma_wal_checkpoint
// Reference https://github.com/WiseLibs/better-sqlite3/issues/978
db.$client.pragma('wal_checkpoint(TRUNCATE)');

const path = import.meta.dirname + '/backups';
mkdirSync(path, { recursive: true });
copyFileSync(env.SQLITE_PATH, path + `/${dateToSafeISOString()}.sqlite`);
