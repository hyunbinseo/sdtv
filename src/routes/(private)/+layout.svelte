<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { PUBLIC_ONBOARD_PATH, PUBLIC_PRIVATE_PATH } from '$env/static/public';
	import Container from '$lib/components/Container.svelte';
	import logo from '$lib/static/logo-horizontal.svg';
	import { t } from './i18n.layout.ts';

	let { data, children } = $props();

	type NavHref = `/${string}`;

	const navLinks = $derived(
		new Map<NavHref, string>([
			[PUBLIC_PRIVATE_PATH as NavHref, t.nav.home],
			['/lorem', 'Lorem'],
			['/ipsum', 'Ipsum']
		])
	);

	const navLinkIsActive = (href: NavHref) => $page.url.pathname.startsWith(href);

	const isOnboarding = $derived($page.url.pathname === PUBLIC_ONBOARD_PATH);
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Container>
	{#snippet topNav()}
		<nav class="top flex h-[--top-navbar-height] shadow-bottom">
			<img src={logo} alt={t.logo} class="my-auto ml-[--container-padding] h-1/2" />
			<div
				class="ml-6 flex flex-1 gap-x-6 overflow-x-auto whitespace-nowrap pr-[--container-padding]"
			>
				<div class="contents max-sm:hidden" class:hidden={isOnboarding}>
					{#each navLinks as [href, label] (href)}
						{@const active = navLinkIsActive(href)}
						<a {href} class:active>{label}</a>
					{/each}
				</div>
				<form method="post" use:enhance class="contents first:*:ml-auto">
					{#if !isOnboarding && data.session.isAdmin}
						{@const href = '/admin'}
						{@const active = navLinkIsActive(href)}
						<a {href} class:active>{t.nav.admin}</a>
					{/if}
					<button formaction="/session/logout">
						{t.nav.logout}
					</button>
				</form>
			</div>
		</nav>
	{/snippet}
	{@render children()}
	{#snippet bottomNav()}
		<nav class="bottom flex h-14 shadow-top *:flex-1" class:hidden={isOnboarding}>
			{#each navLinks as [href, label] (href)}
				{@const active = navLinkIsActive(href)}
				<a {href} class:active>{label}</a>
			{/each}
		</nav>
	{/snippet}
</Container>

<style lang="postcss">
	nav {
		a,
		button {
			@apply flex items-center justify-center border-transparent text-gray-500 hover:border-gray-400 hover:text-gray-700;
		}
		a.active {
			@apply border-blue-800 font-bold text-blue-800;
		}
	}
	nav.top {
		a,
		button {
			@apply border-b-4 pt-1;
		}
	}
	nav.bottom {
		a,
		button {
			@apply border-t-4 pb-1;
		}
	}
</style>
