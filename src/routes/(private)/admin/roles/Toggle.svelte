<script lang="ts">
	import type { Role } from '$lib/server/database/schema.ts';
	import { t } from './i18n.ts';

	type Props = {
		user: { id: string; roles: ReadonlySet<Role> };
		role: Role;
	};

	let { user, role }: Props = $props();

	const isActive = $derived(user.roles.has(role));
</script>

<button
	formaction="?{!isActive ? '/assign' : '/revoke'}&role={encodeURIComponent(role)}"
	name="user-id"
	value={user.id}
	role="switch"
	aria-checked={isActive}
	aria-label={t[role]}
>
	<span></span>
</button>

<style lang="postcss">
	button {
		@apply m-auto block disabled:btn-spinner;
		@apply *:tw-checkbox *:aria-checked:tw-checkbox-checked *:disabled:hidden;
	}
</style>
