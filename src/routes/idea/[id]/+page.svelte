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

	interface Idea {
		id: string;
		title: string;
		description: string;
		problem?: string;
		customer?: string;
		founder_specific?: string;
		analyses?: string[];
		expand?: { analyses?: Analysis[] };
	}

	let idea = $state<Idea | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const id = $derived(page.params.id);

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
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	{#if loading}
		<p class="text-zinc-500 dark:text-zinc-400">Loading...</p>
	{:else if error}
		<p class="text-red-600 dark:text-red-400">{error}</p>
	{:else if idea}
		<a
			href="/"
			class="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-6"
		>
			← Back to ideas
		</a>

		<article class="space-y-8">
			<header>
				<h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{idea.title || 'Untitled'}</h1>
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
		</article>
	{/if}
</div>
