import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { env } from 'node:process';
import { build } from 'vite';

if (!existsSync('svelte.config.js')) {
	console.error('SvelteKit configuration file not found');
	process.exit(1);
}

const buildId = Date.now().toString();

mkdirSync('build', { recursive: true });

writeFileSync(
	'build/start.js',
	`// THIS FILE IS GENERATED ON BUILD

import { loadEnvFile } from 'node:process';

loadEnvFile('.env.production');

await import('./${buildId}/index.js');
`
);

env.BUILD_ID = buildId;
await build();
