<script>
	// The favicon will likely be inlined in production.
	// Reference https://github.com/vitejs/vite/issues/15986

	// SVG favicons are not supported by Safari 18.
	// Reference https://caniuse.com/link-icon-svg

	import logo from '$lib/static/logo.svg';

	let { children } = $props();
</script>

<!-- This root layout file is always inherited. -->
<!-- Therefore, it only includes the essentials. -->
<!-- Use layout groups for further customizations. -->

<svelte:head>
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
