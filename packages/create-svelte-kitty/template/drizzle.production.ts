import { defineConfig } from 'drizzle-kit';
import { loadEnvFile } from 'node:process';
import { object, parse, string } from 'valibot';

loadEnvFile('.env.production');

const env = parse(object({ SQLITE_PATH: string() }), process.env);

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/database/schema.ts',
	dbCredentials: { url: env.SQLITE_PATH },
	casing: 'snake_case'
});
