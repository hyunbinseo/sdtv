import { defineConfig } from 'drizzle-kit';
import { env, loadEnvFile } from 'node:process';

loadEnvFile('.env.production');

if (!env.SQLITE_PATH) throw new TypeError('SQLITE_PATH is undefined');

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/database/schema.ts',
	dbCredentials: { url: env.SQLITE_PATH },
	casing: 'snake_case'
});
