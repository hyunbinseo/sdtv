import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { env, loadEnvFile } from 'node:process';
import { styleText } from 'node:util';
import { ip, object, parse, pipe, string, transform } from 'valibot';
import pkg from '../package.json' with { type: 'json' };

/* eslint-disable no-console */

const rsyncIsAvailable = !spawnSync('rsync', ['--version']).error;
if (!rsyncIsAvailable) throw new Error('rsync is not available');

loadEnvFile('.env.production.local');

const server = parse(
	pipe(
		object({
			SERVER_ADDRESS: pipe(string(), ip()),
			SERVER_USERNAME: string(),
			SERVER_DIRECTORY: string()
		}),
		transform((v) => ({
			address: v.SERVER_ADDRESS,
			username: v.SERVER_USERNAME,
			directory: v.SERVER_DIRECTORY
		}))
	),
	process.env
);

await import(import.meta.dirname + '/build.js');

if (!env.BUILD_ID) throw new Error();

writeFileSync(
	'build/rsync.txt',
	`build/${env.BUILD_ID}/
build/start.js
database/scheduled.ts
drizzle/
src/lib/server/database/
.env.production
drizzle.production.ts
package.json
pm2.config.cjs
`
);

console.log();
console.log(styleText('cyan', 'Sending files:'));

execSync(
	`rsync -avzu --files-from=build/rsync.txt ./ ${server.username}@${server.address}:${server.directory}`,
	{ stdio: 'inherit' }
);

console.log(`
${styleText('cyan', 'Next steps:')}
ssh ${server.username}@${server.address}
pm2 restart server

${styleText('cyan', 'For initial deployment, reference:')}
${pkg.homepage}
`);
