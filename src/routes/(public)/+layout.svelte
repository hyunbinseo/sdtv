<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_APP_PATH } from '$env/static/public';
	import Container from '$lib/components/Container.svelte';
	import logo from '$lib/static/logo-horizontal.svg';
	import { onMount } from 'svelte';
	import { t } from './i18n.layout.ts';

	let { children } = $props();

	let session = $state(false);

	onMount(async () => {
		// TODO Check if session exists
		// const response = await fetch(PUBLIC_APP_PATH);
		// if (response.ok) session = true;
	});

	const navItems = $derived(
		new Map<`/${string}`, string>([
			['/', t.nav.home],
			['/about', t.nav.about],
			!session ? ['/login', t.nav.login] : [PUBLIC_APP_PATH as `/${string}`, t.nav.app]
		])
	);

	// TODO Check if this can be modularized.
	const isActive = (href: `/${string}`) =>
		href === '/' //
			? $page.url.pathname === href
			: $page.url.pathname.startsWith(href);
</script>

<Container>
	{#snippet topNav()}
		<nav class="top flex h-[--top-navbar-height] shadow-bottom">
			<img src={logo} alt={t.logo} class="my-auto ml-[--container-padding] h-1/2 max-sm:mx-auto" />
			<div
				class="ml-6 flex flex-1 gap-x-6 overflow-x-auto whitespace-nowrap pr-[--container-padding] last:*:ml-auto max-sm:hidden"
			>
				{#each navItems as [href, textContent] (href)}
					<a {href} class:active={isActive(href)}>{textContent}</a>
				{/each}
			</div>
		</nav>
	{/snippet}
	{@render children()}
	{#snippet bottomNav()}
		<nav class="bottom flex h-14 shadow-top *:flex-1">
			{#each navItems as [href, textContent] (href)}
				<a {href} class:active={isActive(href)}>{textContent}</a>
			{/each}
		</nav>
	{/snippet}
</Container>

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
	nav.bottom {
		a {
			@apply border-t-4 pb-1;
		}
	}
</style>
