import { argv, exit } from 'node:process';

const command = argv.at(2);

if (
	!(
		command === 'build' || //
		command === 'deploy'
	)
) {
	console.error('Invalid command');
	exit(1);
}

await import(`./scripts/${command}.js`);
