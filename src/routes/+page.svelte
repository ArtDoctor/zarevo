<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';
	import Field from '$lib/components/ui/Field.svelte';
	import ButtonGroup from '$lib/components/ui/ButtonGroup.svelte';

	interface UserRecord {
		credits?: number;
	}

	let activeTab = $state<'simple' | 'advanced'>('simple');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	let mainInput = $state('');
	let geography = $state('');
	let problem = $state('');
	let customer = $state('');
	let founder_specific = $state('');

	const user = $derived($currentUser as UserRecord | null);
	const credits = $derived(user?.credits ?? 0);

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
			founder_specific,
			validationType: 'basic'
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
			founder_specific,
			validationType: 'pro'
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
	<h1 class="text-2xl mb-2">New idea</h1>
	<p class="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
		Everyone has a new idea from time to time.
	</p>

	<div class="flex gap-2 mb-6">
		<button
			type="button"
			onclick={() => activeTab = 'simple'}
			class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'simple' ? 'bg-neutral-800 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-white'}"
		>
			Simple
		</button>
		<button
			type="button"
			onclick={() => activeTab = 'advanced'}
			class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {activeTab === 'advanced' ? 'bg-neutral-800 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-white'}"
		>
			More options
		</button>
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
				Idea description
			</label>
			<Field
				id="main"
				type="textarea"
				bind:value={mainInput}
				placeholder="Describe your idea. Don't overthink it, no prompt magic, be casual."
				rows={4}
				maxChars={800}
			/>
		</div>

		{#if activeTab === 'advanced'}
			<div>
				<label for="geography" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
					Geography
				</label>
				<Field
					id="geography"
					type="input"
					bind:value={geography}
					placeholder="What geographic region do you want to focus on?"
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
					placeholder="Elaborate on the problem you are trying to solve."
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
					placeholder="Who is your target customer?"
					maxChars={200}
				/>
			</div>

			<div>
				<label for="founder_specific" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
					About you
				</label>
				<Field
					id="founder_specific"
					type="textarea"
					bind:value={founder_specific}
					placeholder="Describe yourself and your team to get personalized validation."
					rows={3}
					maxChars={500}
				/>
			</div>
		{/if}

		<ButtonGroup
			onBasic={handleSubmitBasic}
			onPro={handleSubmitPro}
			disabled={submitting}
			credits={credits}
			isAuthenticated={pb.authStore.isValid}
			class="text-lg py-4"
		/>
	</form>
</div>
