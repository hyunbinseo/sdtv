import { dev } from '$app/environment';
import type { PageLoad } from './$types.js';
import { t } from './i18n.ts';

export const prerender = true;

// ES2023 might not be supported by legacy browsers.
// Generate a plain HTML and CSS page by disabling CSR.
// Reference https://svelte.dev/docs/kit/page-options#csr
export const csr = dev;

export const load = (() => ({ pageTitle: t.pageTitle })) satisfies PageLoad;
