<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';

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
			<textarea
				id="main"
				bind:value={mainInput}
				placeholder="Describe your idea. Don't overthink it, no prompt magic, be casual."
				class="w-full h-24 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
				style="--tw-ring-color: var(--color-primary);"
				rows="4"
			></textarea>
		</div>

		{#if activeTab === 'advanced'}
			<div>
				<label for="geography" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
					Geography
				</label>
				<input
					id="geography"
					type="text"
					bind:value={geography}
					placeholder="What geographic region do you want to focus on?"
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
					placeholder="Elaborate on the problem you are trying to solve."
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
					placeholder="Who is your target customer?"
					class="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent"
					style="--tw-ring-color: var(--color-primary);"
				/>
			</div>

			<div>
				<label for="founder_specific" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
					About you
				</label>
				<textarea
					id="founder_specific"
					bind:value={founder_specific}
					placeholder="Describe yourself and your team to get personalized validation."
					class="w-full h-20 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
					style="--tw-ring-color: var(--color-primary);"
					rows="3"
				></textarea>
			</div>
		{/if}

		<div class="flex flex-col sm:flex-row gap-3">
			<button
				type="submit"
				disabled={submitting || (pb.authStore.isValid && credits < 1)}
				title={pb.authStore.isValid && credits < 1 ? 'Requires at least 1 credit' : ''}
				class="btn btn-lg btn-primary flex-1 text-lg py-4"
			>
				Basic validation
			</button>
			<button
				type="button"
				onclick={handleSubmitPro}
				disabled={submitting || (pb.authStore.isValid && credits < 4)}
				title={pb.authStore.isValid && credits < 4 ? 'Requires at least 4 credits' : ''}
				class="btn btn-lg btn-secondary flex-1 text-lg py-4"
			>
				Advanced validation
			</button>
		</div>
	</form>
</div>
