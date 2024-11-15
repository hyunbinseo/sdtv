<script>
	import { enhance } from '$app/forms';
	import formStyles from '$lib/styles/form.module.css';
	import { createSubmitFunction } from 'svelte-form-enhanced';
	import { t } from './i18n.ts';
</script>

<form
	method="post"
	use:enhance={createSubmitFunction()}
	class="{formStyles.stacked} {formStyles.underline} mx-auto my-8 flex w-full max-w-80 flex-col md:my-16"
>
	<h1 class="text-2xl font-bold">{t.welcome}</h1>
	<p class="mt-1">{t['tell-us-about-yourself']}</p>
	<label class="mt-10">
		<span>{t['given-name']}</span>
		<input type="text" name="given-name" placeholder={t.john} pattern="\S.*" required />
	</label>
	<label class="mt-8">
		<span>{t.surname}</span>
		<input type="text" name="surname" placeholder={t.doe} pattern="\S.*" required />
	</label>
	<button class="btn btn-primary mt-10 disabled:btn-spinner">{t['get-started']}</button>
</form>
