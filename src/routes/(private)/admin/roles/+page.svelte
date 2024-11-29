<script lang="ts">
	import { enhance } from '$app/forms';
	import formStyles from '$lib/styles/form.module.css';
	import { createFormHelper } from 'svelte-form-enhanced';
	import { Modal } from 'svelte-html-modal';
	import { slide } from 'svelte/transition';
	import { t } from './i18n.ts';
	import Toggle from './Toggle.svelte';

	let { data, form } = $props();

	$effect(() => {
		if (form?.userId && f.state === 'standby') form = null;
	});

	let isOpen = $state(false);
	const f = createFormHelper({ updateOptions: { reset: false } });
	const f2 = createFormHelper();
</script>

<div class="modal-wrapper">
	<Modal bind:isOpen closeOnBackdropClick={f.state !== 'submitting'}>
		<form
			method="post"
			use:enhance={f.submitFunction}
			class="{formStyles.stacked} {formStyles.underline} flex flex-col"
		>
			{#if !form || form.users?.length === 0}
				<h1 class="text-xl font-bold">{t['search-user']}</h1>
				<label class="mt-4">
					<span>{t['given-name']}</span>
					<input type="text" name="given-name" placeholder={t.john} pattern="\S.*" required />
				</label>
				{#if form?.users?.length === 0 && f.state !== 'submitting'}
					<p transition:slide class="mt-2 text-red-800 text-smallish">
						{t['no-search-results']}
					</p>
				{/if}
				<button
					formaction="?/search"
					disabled={f.state === 'submitting'}
					class="btn btn-primary mt-4 disabled:btn-spinner"
				>
					{t.search}
				</button>
			{:else if form.users}
				<h1 class="text-xl font-bold">{t['assign-new-role']}</h1>
				<label class="mt-4">
					<span>{t.user}</span>
					<select name="user-id" class="truncate" required>
						{#if form.users.length > 1}
							<option value="">---</option>
						{/if}
						{#each form.users as user (user.id)}
							<option value={user.id}>
								{user.profile.givenName}
								{user.profile.surname}
								({user.contact})
							</option>
						{/each}
					</select>
				</label>
				<label class="mt-4">
					<span>{t['new-role']}</span>
					<select name="role" required>
						<option value="admin">{t.admin}</option>
						<option value="superuser">{t.superuser}</option>
					</select>
				</label>
				<nav class="mt-4 flex gap-x-4">
					<button type="button" onclick={() => (form = null)} class="btn btn-secondary">
						{t['go-back']}
					</button>
					<button
						formaction="?/assign"
						disabled={f.state === 'submitting'}
						class="btn btn-primary flex-1 disabled:btn-spinner"
					>
						{t['assign-role']}
					</button>
				</nav>
			{:else if form.userId}
				<h1 class="text-xl font-bold">{t['assigned-role']}</h1>
				<nav class="mt-4 flex gap-x-4">
					<button type="button" onclick={() => (form = null)} class="btn btn-secondary">
						{t['start-over']}
					</button>
					<a
						href="#{form.userId}"
						data-sveltekit-reload
						class="btn btn-primary flex-1"
						onclick={() => (isOpen = false)}
					>
						{t.close}
					</a>
				</nav>
			{/if}
		</form>
	</Modal>
</div>

<form method="post" use:enhance={f2.submitFunction}>
	<nav
		class="-mx-[--container-padding] flex gap-x-3 overflow-x-auto whitespace-nowrap px-[--container-padding]"
	>
		<button type="button" onclick={() => (isOpen = true)} class="btn btn-xs btn-secondary">
			{t['assign-new-role']}
		</button>
	</nav>
	<p class:hidden={data.users.length} class="mt-6">{t['no-data-to-show']}</p>
	<div class:hidden={!data.users.length} class="-mx-[--container-padding] mt-4 overflow-x-auto">
		<table class="min-w-full">
			<thead>
				<tr>
					<th class="text-left">{t.name}</th>
					<th class="text-left">{t.contact}</th>
					<th>{t.admin}</th>
					<th>{t.superuser}</th>
				</tr>
			</thead>
			<tbody class="border-t-[1px] border-gray-200 odd:*:bg-gray-100 target:*:bg-yellow-50">
				{#each data.users as user (user.id)}
					<tr id={user.id}>
						{#if user.profile}
							<td>
								{user.profile.givenName}
								{user.profile.surname}
							</td>
						{:else}
							<td></td>
						{/if}
						<td>{user.contact}</td>
						<td><Toggle {user} role="admin"></Toggle></td>
						<td><Toggle {user} role="superuser"></Toggle></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</form>

<style lang="postcss">
	.modal-wrapper > :global(dialog) {
		@apply w-80 rounded-md p-4 backdrop:backdrop-blur backdrop:backdrop-brightness-50;
	}
</style>
