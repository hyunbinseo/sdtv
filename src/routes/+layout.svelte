<script>
	// Small SVG files will likely be inlined in production.
	// Reference https://github.com/vitejs/vite/issues/15986
	import logo from '$lib/static/logo.svg';

	import { page } from '$app/stores';
	import { PUBLIC_SITE_NAME as SITE_NAME } from '$env/static/public';
	import '../app.css';

	let { children } = $props();
</script>

<!-- This root layout file is always inherited. -->
<!-- Therefore, it only includes the essentials. -->
<!-- Use layout groups for further customizations. -->

<svelte:head>
	<!-- PageData values can be undefined despite being typed. -->
	<!-- Blocked by https://github.com/sveltejs/kit/issues/11018 -->
	<title>
		{$page.data.pageTitle && $page.url.pathname !== '/' //
			? `${$page.data.pageTitle} - ${SITE_NAME}`
			: SITE_NAME}
	</title>
	<!-- SVG favicons are not supported by Safari 18. -->
	<!-- Reference https://caniuse.com/link-icon-svg -->
	<link rel="icon" href={logo} />
	<script>
		(function () {
			if (window.location.pathname === '/unsupported') return;
			var isSupported =
				typeof [].toReversed === 'function' && // ES2023
				CSS.supports('selector(:has(a))');
			if (!isSupported) window.location.href = '/unsupported';
		})();
	</script>
</svelte:head>

{@render children()}
