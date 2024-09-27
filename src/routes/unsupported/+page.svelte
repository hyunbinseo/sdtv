<svelte:head>
	<!-- Reference src/routes/+layout.svelte -->
	<script>
		{
			var isSupported =
				typeof [].toReversed === 'function' && // ES2023
				CSS.supports('selector(:has(a))');
			if (isSupported) window.location.href = '/';
		}
	</script>
	<meta name="robots" content="noindex" />
</svelte:head>
