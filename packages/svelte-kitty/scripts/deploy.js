import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { exit, loadEnvFile } from 'node:process';
import { parseEnv, styleText } from 'node:util';
import { ip, object, parse, pipe, string, transform } from 'valibot';
import pkg from '../package.json' with { type: 'json' };

/* eslint-disable no-console */

const rsyncIsAvailable = !spawnSync('rsync', ['--version']).error;

if (!rsyncIsAvailable) {
	console.error('rsync command not found. Is it installed in the system?');
	exit(1);
}

const parsedEnv = parseEnv(readFileSync('.env.production.local', 'utf8'));
const envHasEmptyValues = Object.values(parsedEnv).some((value) => value === '');

if (envHasEmptyValues) {
	console.error('.env.production.local cannot contain empty values.');
	exit(1);
}

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

console.log();
console.log(styleText('cyan', 'Transferring files using rsync over SSH:'));
console.log('Tap the security key if 2FA is required.');

execSync(
	`rsync -avzru --files-from=build/rsync.txt ./ ${server.username}@${server.address}:${server.directory}`,
	{ stdio: 'inherit' }
);

console.log(`
${styleText('cyan', 'Next steps:')}
ssh ${server.username}@${server.address}
pm2 restart server

${styleText('cyan', 'For initial deployment, reference:')}
${pkg.homepage}
`);
