<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { validationFormStore, setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate } from '$lib/api/ideas';

	interface Props {
		backHref: string;
		backLabel: string;
		redirectIfAuthenticated?: boolean;
	}

	let { backHref, backLabel, redirectIfAuthenticated = true }: Props = $props();

	let mainInput = $state('');
	let geography = $state('');
	let problem = $state('');
	let customer = $state('');
	let founder_specific = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		if (redirectIfAuthenticated && pb.authStore.isValid) {
			goto('/', { replaceState: true });
		}
		const stored = get(validationFormStore);
		mainInput = stored.startupIdea;
		geography = stored.geography;
		problem = stored.problem;
		customer = stored.customer;
		founder_specific = stored.founder_specific;
	});

	async function handleSubmit() {
		setValidationForm({
			startupIdea: mainInput,
			geography,
			problem,
			customer,
			founder_specific
		});
		if (!pb.authStore.isValid) {
			requestSignIn();
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAndNavigate({
				description: mainInput,
				problem,
				customer,
				founder_specific
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create idea';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	<a
		href={backHref}
		class="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 mb-6"
	>
		← {backLabel}
	</a>
	<h1 class="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-8">Advanced Validation</h1>

	{#if error}
		<p class="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-6"
	>
		<div>
			<label for="main" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Startup idea
			</label>
			<textarea
				id="main"
				bind:value={mainInput}
				placeholder="Describe your startup idea..."
				class="w-full h-24 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
				rows="4"
			></textarea>
		</div>

		<div>
			<label for="geography" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Geography
			</label>
			<input
				id="geography"
				type="text"
				bind:value={geography}
				placeholder="Geographic region to focus on"
				class="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="problem" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Problem
			</label>
			<textarea
				id="problem"
				bind:value={problem}
				placeholder="What is the problem you are exactly trying to solve? How are you different from competitors?"
				class="w-full h-20 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
				rows="3"
			></textarea>
		</div>

		<div>
			<label for="customer" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Customer
			</label>
			<input
				id="customer"
				type="text"
				bind:value={customer}
				placeholder="What's your target customer?"
				class="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="founder_specific" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Founder specific
			</label>
			<textarea
				id="founder_specific"
				bind:value={founder_specific}
				placeholder="What do you have that you think gives you an advantage?"
				class="w-full h-20 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
				rows="3"
			></textarea>
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Validate
		</button>
	</form>
</div>
