import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { build } from 'vite';

if (!existsSync('svelte.config.js')) {
	console.error('SvelteKit configuration file not found');
	process.exit(1);
}

const buildId = Date.now();

mkdirSync('build', { recursive: true });

writeFileSync(
	'build/start.js',
	`// THIS FILE IS GENERATED ON BUILD

import { loadEnvFile } from 'node:process';

loadEnvFile('.env.production');
loadEnvFile('build/.env.local');

await import('./${buildId}/index.js');
`
);

const envFile = 'build/.env.local';

writeFileSync(
	envFile,
	`# THIS FILE IS GENERATED ON BUILD

BUILD_ID="${buildId}"

HOST="0.0.0.0"
PORT="3000"
ORIGIN="http://0.0.0.0:3000"
`
);

loadEnvFile(envFile);

await build();
