<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { checkAuth } from '$lib/pocketbase';
	import { pb } from '$lib/pocketbase';
	import { page } from '$app/state';

	interface Analysis {
		id: string;
		status: 'pending' | 'in_progress' | 'done' | 'error';
		type: string;
		result: unknown;
	}

	interface IdeaFeature {
		title: string;
		description?: string;
		expected_signup_increase_pct: number;
	}

	interface Idea {
		id: string;
		title: string;
		description: string;
		problem?: string;
		customer?: string;
		founder_specific?: string;
		analyses?: string[];
		features?: IdeaFeature[];
		expand?: { analyses?: Analysis[] };
	}

	let idea = $state<Idea | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let editingTitle = $state(false);
	let editTitleValue = $state('');
	let savingTitle = $state(false);
	let titleError = $state<string | null>(null);

	const id = $derived(page.params.id);
	const canBuildSmokeTest = $derived(
		idea != null &&
		Array.isArray(idea.features) &&
		idea.features.length > 0 &&
		idea.features.every(
			(f) =>
				typeof f === 'object' &&
				f != null &&
				typeof (f as IdeaFeature).title === 'string' &&
				typeof (f as IdeaFeature).expected_signup_increase_pct === 'number'
		)
	);
	const polling = $derived(shouldPoll(idea));

	function shouldPoll(i: Idea | null): boolean {
		if (!i) return false;
		if (!i.title || i.title === 'none') return true;
		const analyses = i.expand?.analyses ?? [];
		return analyses.some((a) => a.status === 'in_progress' || a.status === 'pending');
	}

	async function fetchIdea(): Promise<void> {
		if (!id) return;
		try {
			const record = await pb.collection('ideas').getOne<Idea>(id, { expand: 'analyses' });
			idea = record;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load idea';
		} finally {
			loading = false;
		}
	}

	let pollInterval: ReturnType<typeof setInterval> | null = null;

	onMount(async () => {
		await checkAuth();
		if (!id) return;
		await fetchIdea();

		pollInterval = setInterval(async () => {
			if (!shouldPoll(idea)) return;
			await fetchIdea();
		}, 2000);
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});

	function statusColor(status: string): string {
		switch (status) {
			case 'done':
				return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200';
			case 'in_progress':
				return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
			case 'error':
				return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
			default:
				return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300';
		}
	}

	function startEditTitle() {
		editTitleValue = idea?.title ?? '';
		titleError = null;
		editingTitle = true;
	}

	function cancelEditTitle() {
		editingTitle = false;
		editTitleValue = '';
		titleError = null;
	}

	async function saveTitle() {
		if (!id || !idea) return;
		savingTitle = true;
		titleError = null;
		try {
			const updated = await pb.collection('ideas').update<Idea>(id, { title: editTitleValue.trim() });
			idea = { ...updated, expand: idea.expand };
			editingTitle = false;
			editTitleValue = '';
		} catch (e) {
			titleError = e instanceof Error ? e.message : 'Failed to update title';
		} finally {
			savingTitle = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	{#if loading}
		<p class="text-zinc-500 dark:text-zinc-400">Loading...</p>
	{:else if error}
		<p class="text-red-600 dark:text-red-400">{error}</p>
	{:else if idea}
		<div class="flex items-center justify-between mb-6">
			<a
				href="/"
				class="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
			>
				← Back to ideas
			</a>
			{#if polling}
				<span class="inline-flex items-center gap-1.5 text-sm text-primary">
					<svg class="size-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Updating...
				</span>
			{/if}
		</div>

		<article class="space-y-8">
			<header>
				{#if editingTitle}
					<form
						onsubmit={(e) => {
							e.preventDefault();
							saveTitle();
						}}
						class="flex flex-wrap items-center gap-2"
					>
						<input
							type="text"
							bind:value={editTitleValue}
							placeholder="Idea title"
							class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<button type="submit" disabled={savingTitle} class="btn btn-sm btn-primary">
							{savingTitle ? 'Saving...' : 'Save'}
						</button>
						<button
							type="button"
							onclick={cancelEditTitle}
							disabled={savingTitle}
							class="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm disabled:opacity-50"
						>
							Cancel
						</button>
					</form>
					{#if titleError}
						<p class="mt-1 text-sm text-red-600 dark:text-red-400">{titleError}</p>
					{/if}
				{:else}
					<div class="flex items-center gap-2 flex-wrap">
						<h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{idea.title || 'Untitled'}</h1>
						<button
							type="button"
							onclick={startEditTitle}
							class="text-sm text-primary hover:underline"
							title="Edit title"
						>
							Edit
						</button>
					</div>
				{/if}
				{#if idea.description}
					<p class="mt-2 text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{idea.description}</p>
				{/if}
			</header>

			<div class="space-y-6 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 bg-white dark:bg-zinc-900/50">
				{#if idea.problem}
					<div>
						<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Problem</dt>
						<dd class="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{idea.problem}</dd>
					</div>
				{/if}
				{#if idea.customer}
					<div>
						<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Customer</dt>
						<dd class="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{idea.customer}</dd>
					</div>
				{/if}
				{#if idea.founder_specific}
					<div>
						<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Founder specific</dt>
						<dd class="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{idea.founder_specific}</dd>
					</div>
				{/if}
			</div>

			{#if (idea.expand?.analyses ?? []).length > 0}
				<section>
					<h2 class="text-lg font-medium text-zinc-800 dark:text-zinc-200 mb-4">Analyses</h2>
					<div class="space-y-4">
						{#each idea.expand?.analyses ?? [] as a}
							<div class="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900/50">
								<div class="flex items-center gap-2 mb-2">
									<span class="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{a.type ?? 'unknown'}</span>
									<span class="px-2 py-0.5 rounded text-xs font-medium {statusColor(a.status ?? 'pending')}">{a.status?.replace('_', ' ') ?? 'pending'}</span>
								</div>
								{#if a.result != null}
									<pre class="mt-2 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm overflow-x-auto">{JSON.stringify(a.result, null, 2)}</pre>
								{:else}
									<p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No result yet</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<div class="pt-4 flex flex-wrap gap-3">
				{#if canBuildSmokeTest}
					<a
						href="/idea/{id}/smoke-test"
						class="btn btn-md btn-primary"
					>
						Build smoke test
					</a>
				{:else}
					<span
						class="btn btn-md btn-primary opacity-50 cursor-not-allowed"
						title="Pro validation required – basic validation does not include all analyses needed for smoke tests"
					>
						Build smoke test
					</span>
				{/if}
			</div>
		</article>
	{/if}
</div>
