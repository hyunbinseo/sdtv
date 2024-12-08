import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { env } from 'node:process';
import { digits, optional, parse, pipe, string, transform } from 'valibot';

const AdapterOutSchema = optional(
	pipe(
		string(),
		digits(),
		transform((id) => `build/${id}`)
	)
);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			out: parse(AdapterOutSchema, env.BUILD_ID),
			envPrefix: '' // do not change this value
		})
	}
};

export default config;
