import type { PageLoad } from './$types.js';
import { t } from './i18n.page.ts';

export const prerender = true;

export const load = (() => ({ pageTitle: t.pageTitle })) satisfies PageLoad;
