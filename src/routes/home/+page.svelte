<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import IdeaInput from '$lib/components/IdeaInput.svelte';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';

	interface UserRecord {
		credits?: number;
	}

	let submitting = $state(false);
	let error = $state<string | null>(null);

	const user = $derived($currentUser as UserRecord | null);
	const credits = $derived(user?.credits ?? 0);

	onMount(() => {
		if (pb.authStore.isValid) {
			goto('/', { replaceState: true });
		}
	});

	async function handleSubmit(startupIdea: string) {
		setValidationForm({ startupIdea, validationType: 'basic' });
		if (!pb.authStore.isValid) {
			requestSignIn();
			return;
		}
		if (credits < 1) {
			error = 'Basic validation requires at least 1 credit';
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

	async function handleSubmitPro(startupIdea: string) {
		setValidationForm({ startupIdea, validationType: 'pro' });
		if (!pb.authStore.isValid) {
			requestSignIn();
			return;
		}
		if (credits < 4) {
			error = 'Pro validation requires at least 4 credits';
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAdvancedAndNavigate({
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
	<h2 class="text-2xl md:text-3xl text-center mb-8">
		Imagine a startup. Now validate it.
	</h2>

	{#if error}
		<p class="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
	<IdeaInput
		onSubmit={handleSubmit}
		onSubmitPro={handleSubmitPro}
		advancedPath="/home/advanced"
		credits={credits}
		isAuthenticated={pb.authStore.isValid}
		disabled={submitting}
	/>
</div>
