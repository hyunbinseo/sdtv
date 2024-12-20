import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { env } from 'node:process';
import { build } from 'vite';

if (!existsSync('svelte.config.js')) {
	console.error('svelte.config.js not found in this directory');
	process.exit(1);
}

const buildId = Date.now().toString();

mkdirSync('build', { recursive: true });

env.BUILD_ID = buildId;
await build();

writeFileSync(
	'build/start.js',
	`// THIS FILE IS GENERATED ON BUILD

import { loadEnvFile } from 'node:process';

loadEnvFile('.env.production');

await import('./${buildId}/index.js');
`
);

writeFileSync(
	'build/rsync.txt',
	`
+ /build/
+ /build/${env.BUILD_ID}/client/_app/***
- /build/${env.BUILD_ID}/client/*
+ /build/${env.BUILD_ID}/***
+ /build/start.js
+ /database/
+ /database/scheduled.ts
+ /drizzle/***
+ /src/
+ /src/lib/
+ /src/lib/server/
+ /src/lib/server/database/***
+ /static/***
+ /.env.production
+ /.node-version
+ /drizzle.production.ts
+ /package.json
+ /pm2.config.cjs
- *
`
);
