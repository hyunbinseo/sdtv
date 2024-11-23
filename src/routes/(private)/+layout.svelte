<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_ONBOARD_PATH, PUBLIC_PRIVATE_PATH } from '$env/static/public';
	import Container from '$lib/components/Container.svelte';
	import logo from '$lib/static/logo-horizontal.svg';
	import { onMount } from 'svelte';
	import { digits, literal, minValue, nullable, pipe, safeParse, string, transform } from 'valibot';
	import { t } from './i18n.layout.ts';

	let { data, children } = $props();

	$effect(() => {
		localStorage.setItem('sessionExpiresAt', data.session.expiresAt.toString());
	});

	onMount(() => {
		const renewalIntervalId = window.setInterval(async () => {
			const parsedExpiresAt = safeParse(
				pipe(string(), digits(), transform(Number), literal(data.session.expiresAt)),
				localStorage.getItem('sessionExpiresAt')
			);

			if (!parsedExpiresAt.success) return invalidate('private:session');
			if (parsedExpiresAt.output - Date.now() > data.session.renewalThreshold) return;

			const parsedRenewalStart = safeParse(
				nullable(pipe(string(), digits(), transform(Number), minValue(Date.now() - 60 * 1000))),
				localStorage.getItem('sessionRenewalStart')
			);

			if (!parsedRenewalStart.success) return localStorage.removeItem('sessionRenewalStart');
			if (parsedRenewalStart.output) return;

			try {
				localStorage.setItem('sessionRenewalStart', Date.now().toString());
				await fetch('/session/renew', { method: 'POST' });
			} finally {
				localStorage.removeItem('sessionRenewalStart');
				await invalidate('private:session');
			}
		}, 60 * 1000);

		return () => {
			window.clearInterval(renewalIntervalId);
		};
	});

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
