import { dev } from '$app/environment';

export const prerender = true;

// ES2023 might not be supported by legacy browsers.
// Generate a plain HTML and CSS page by disabling CSR.
// Reference https://kit.svelte.dev/docs/page-options#csr
export const csr = dev;
