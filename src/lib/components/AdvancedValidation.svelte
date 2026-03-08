<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import { validationFormStore, setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';
	import Field from '$lib/components/ui/Field.svelte';
	import ButtonGroup from '$lib/components/ui/ButtonGroup.svelte';
	import Button from '$lib/components/ui/Button.svelte';

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
<div class="flex items-center gap-3 mb-8">
	<Button
		variant="icon"
		color="white"
		size="sm"
		href={backHref}
		title={backLabel}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m15 18-6-6 6-6"/>
		</svg>
	</Button>
	<h1 class="text-2xl">Ideas in. Unicorn ideas out.</h1>
</div>

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
			<Field
				id="main"
				type="textarea"
				bind:value={mainInput}
				placeholder="Describe your startup idea..."
				rows={4}
				maxChars={800}
			/>
		</div>

		<div>
			<label for="geography" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Geography
			</label>
			<Field
				id="geography"
				type="input"
				bind:value={geography}
				placeholder="Geographic region to focus on"
				maxChars={200}
			/>
		</div>

		<div>
			<label for="problem" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Problem
			</label>
			<Field
				id="problem"
				type="textarea"
				bind:value={problem}
				placeholder="What is the problem you are exactly trying to solve? How are you different from competitors?"
				rows={3}
				maxChars={500}
			/>
		</div>

		<div>
			<label for="customer" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Customer
			</label>
			<Field
				id="customer"
				type="input"
				bind:value={customer}
				placeholder="What's your target customer?"
				maxChars={200}
			/>
		</div>

		<div>
			<label for="founder_specific" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Founder specific
			</label>
			<Field
				id="founder_specific"
				type="textarea"
				bind:value={founder_specific}
				placeholder="What do you have that you think gives you an advantage?"
				rows={3}
				maxChars={500}
			/>
		</div>

		<ButtonGroup
			onBasic={handleSubmitBasic}
			onPro={handleSubmitPro}
			disabled={submitting}
			credits={credits}
			isAuthenticated={pb.authStore.isValid}
			class="text-lg"
		/>
	</form>
</div>
