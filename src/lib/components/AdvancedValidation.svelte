<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import { validationFormStore, setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';

	interface Props {
		backHref: string;
		backLabel: string;
		redirectIfAuthenticated?: boolean;
	}

	interface UserRecord {
		credits?: number;
	}

	let { backHref, backLabel, redirectIfAuthenticated = true }: Props = $props();

	let mainInput = $state('');
	let geography = $state('');
	let problem = $state('');
	let customer = $state('');
	let founder_specific = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const user = $derived($currentUser as UserRecord | null);
	const credits = $derived(user?.credits ?? 0);

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

	const payload = $derived({
		description: mainInput,
		problem,
		customer,
		founder_specific
	});

	async function handleSubmitBasic() {
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
		if (credits < 1) {
			error = 'Basic validation requires at least 1 credit';
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAndNavigate(payload);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create idea';
		} finally {
			submitting = false;
		}
	}

	async function handleSubmitPro() {
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
		if (credits < 4) {
			error = 'Pro validation requires at least 4 credits';
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAdvancedAndNavigate(payload);
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
		class="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-6"
	>
		← {backLabel}
	</a>
	<h1 class="text-2xl mb-8">Advanced Validation</h1>

	{#if error}
		<p class="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
	{/if}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmitBasic();
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
				class="w-full h-24 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
				style="--tw-ring-color: var(--color-primary);"
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
				class="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent"
				style="--tw-ring-color: var(--color-primary);"
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
				class="w-full h-20 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
				style="--tw-ring-color: var(--color-primary);"
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
				class="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent"
				style="--tw-ring-color: var(--color-primary);"
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
				class="w-full h-20 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
				style="--tw-ring-color: var(--color-primary);"
				rows="3"
			></textarea>
		</div>

		<div class="flex flex-col sm:flex-row gap-3">
			<button
				type="submit"
				disabled={submitting || credits < 1}
				title={credits < 1 ? 'Requires at least 1 credit' : ''}
				class="btn btn-lg btn-primary flex-1 text-lg py-4"
			>
				Validate - basic
			</button>
			<button
				type="button"
				onclick={handleSubmitPro}
				disabled={submitting || credits < 4}
				title={credits < 4 ? 'Requires at least 4 credits' : ''}
				class="btn btn-lg btn-secondary flex-1 text-lg py-4"
			>
				Validate - pro
			</button>
		</div>
	</form>
</div>
