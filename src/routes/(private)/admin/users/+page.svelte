<script lang="ts">
	import { enhance } from '$app/forms';
	import { createFormHelper } from 'svelte-form-enhanced';
	import { t } from './i18n.ts';

	let { data } = $props();

	const f = createFormHelper();
	let checkedUsers = $state<string[]>([]);
</script>

<form method="post" use:enhance={f.submitFunction}>
	<nav
		class="-mx-[--container-padding] flex gap-x-3 overflow-x-auto whitespace-nowrap px-[--container-padding]"
	>
		{#if !checkedUsers.length}
			<a href={!data.showDeactivated ? '?deactivated' : '?'} class="btn btn-xs btn-secondary">
				{!data.showDeactivated ? t['show-deactivated-users'] : t['show-active-users']}
			</a>
		{:else}
			<button type="reset" class="btn btn-xs btn-secondary">{t.reset}</button>
			<!-- NOTE Even if the button is hidden, the form can be submitted using keyboard. -->
			<!-- Therefore, JavaScript is used to remove the button when no rows are checked. -->
			<button
				formaction="?/deactivate"
				disabled={f.state === 'submitting'}
				class="btn btn-xs btn-danger disabled:btn-spinner"
			>
				{t.deactivate} ({checkedUsers.length})
			</button>
		{/if}
	</nav>
	<p class:hidden={data.users.length} class="mt-6">{t['no-data-to-show']}</p>
	<div class:hidden={!data.users.length} class="-mx-[--container-padding] mt-4 overflow-x-auto">
		<table class="min-w-full">
			<thead>
				<tr class="last:*:w-full">
					{#if !data.showDeactivated}
						<th>{t.select}</th>
					{/if}
					<th class="text-left">{t.name}</th>
					<th class="text-left">{t.contact}</th>
					{#if data.showDeactivated}
						<th class="text-left">{t['deactivated-at']}</th>
					{/if}
				</tr>
			</thead>
			<tbody
				class="border-t-[1px] border-gray-200 odd:*:bg-gray-100 has-[:checked]:odd:*:bg-blue-100 has-[:checked]:even:*:bg-blue-50"
			>
				{#each data.users as user (user.id)}
					<tr>
						{#if !data.showDeactivated}
							<td>
								<input
									bind:group={checkedUsers}
									type="checkbox"
									name="user-id"
									value={user.id}
									id={user.id}
								/>
							</td>
						{/if}
						<td>
							{#if user.profile}
								<label for={user.id}>
									{user.profile.givenName}
									{user.profile.surname}
								</label>
							{/if}
						</td>
						<td>{user.contact}</td>
						{#if data.showDeactivated && user.deactivatedAt}
							<!-- NOTE Used UTC timezone to match SSR and CSR. -->
							<td>{user.deactivatedAt.toISOString().substring(0, 10)}</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</form>

<style lang="postcss">
	td:empty::after {
		content: '-';
	}
	td > input[type='checkbox'] {
		@apply m-auto block;
	}
</style>
