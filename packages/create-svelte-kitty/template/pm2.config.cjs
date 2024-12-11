// Reference https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
	/** @type {import('pm2-ecosystem').StartOptions[]} */
	apps: [
		{
			name: 'db:scheduled',
			script: './database/scheduled.ts',
			interpreter: 'node',
			interpreter_args: [
				'--no-warnings=ExperimentalWarning',
				'--experimental-strip-types',
				'--env-file=.env.production'
			],
			time: true, // auto prefix logs with date
			autorestart: false,
			cron: '0 0 * * *'
		},
		{
			name: 'server',
			script: './build/start.js',
			interpreter: 'node',
			instances: -1,
			exec_mode: 'cluster',
			time: true, // auto prefix logs with date
			autorestart: true
		}
	]
};
