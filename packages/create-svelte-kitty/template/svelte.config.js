import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { digits, object, optional, parse, pipe, string } from 'valibot';

// The BUILD_ID environment variable is set by the svelte-kitty build scripts.
const env = parse(object({ BUILD_ID: optional(pipe(string(), digits())) }), process.env);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: env.BUILD_ID ? `build/${env.BUILD_ID}` : undefined,
			envPrefix: '' // do not change
		}),
		appDir: '_app' // do not change
	}
};

export default config;
