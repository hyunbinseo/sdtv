<script lang="ts">
	import { page } from '$app/stores';
	import { t } from './i18n.layout.ts';

	let { data, children } = $props();

	type NavHref = '/admin' | `/admin/${string}`;

	const navLinks = $derived(
		new Map<NavHref, string>(
			!data.session.isSuperuser
				? [['/admin', t.nav.dashboard]]
				: [
						['/admin', t.nav.dashboard],
						['/admin/users', t.nav.users],
						['/admin/roles', t.nav.roles]
					]
		)
	);

	const navLinkIsActive = (href: NavHref) =>
		href === '/admin'
			? $page.url.pathname === href //
			: $page.url.pathname.startsWith(href);
</script>

<header
	class="relative z-10 -m-[--container-padding] mb-0 border-t-[1px] bg-white px-[--container-padding] pt-16"
>
	<h1 class="text-3xl font-bold">{t.title}</h1>
</header>

<nav
	class="top sticky top-0 z-10 -mx-[--container-padding] flex h-[--top-navbar-height] gap-x-6 overflow-x-auto whitespace-nowrap bg-white px-[--container-padding] shadow-bottom"
>
	{#each navLinks as [href, label] (href)}
		{@const active = navLinkIsActive(href)}
		<a {href} class:active>{label}</a>
	{/each}
</nav>

<!-- Restore container padding-top without margin collapse. -->
<div class="-mx-[--container-padding] h-[--container-padding]"></div>

{@render children()}

<style lang="postcss">
	nav {
		a {
			@apply flex items-center justify-center border-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700;
		}
		a.active {
			@apply border-blue-800 font-bold text-blue-800;
		}
	}
	nav.top {
		a {
			@apply border-b-4 pt-1;
		}
	}
</style>
