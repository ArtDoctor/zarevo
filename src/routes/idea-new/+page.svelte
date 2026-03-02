<script lang="ts">
	import IdeaInput from '$lib/components/IdeaInput.svelte';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	function handleSubmit(startupIdea: string) {
		setValidationForm({ startupIdea });
		if (pb.authStore.isValid) {
			goto('/');
		} else {
			requestSignIn();
		}
	}
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center px-4">
	<h2 class="text-2xl md:text-3xl font-semibold text-center text-zinc-800 dark:text-zinc-200 mb-8">
		Imagine a startup. Now validate it.
	</h2>

	<IdeaInput onSubmit={handleSubmit} />
</div>
