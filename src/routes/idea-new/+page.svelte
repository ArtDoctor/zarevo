<script lang="ts">
	import IdeaInput from '$lib/components/IdeaInput.svelte';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { pb } from '$lib/pocketbase';
	import { createIdeaAndNavigate } from '$lib/api/ideas';

	let submitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(startupIdea: string) {
		setValidationForm({ startupIdea });
		if (!pb.authStore.isValid) {
			requestSignIn();
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAndNavigate({
				description: startupIdea,
				problem: '',
				customer: '',
				founder_specific: ''
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create idea';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center px-4">
	<h2 class="text-2xl md:text-3xl font-semibold text-center text-zinc-800 dark:text-zinc-200 mb-8">
		Imagine a startup. Now validate it.
	</h2>

	{#if error}
		<p class="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
	<IdeaInput onSubmit={handleSubmit} advancedPath="/idea-new/advanced" disabled={submitting} />
</div>
