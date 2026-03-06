<script lang="ts">
	import { onMount } from 'svelte';
	import { checkAuth } from '$lib/pocketbase';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	interface Idea {
		id: string;
		title: string;
		description: string;
	}

	let ideas = $state<Idea[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let selectedIds = $state<Set<string>>(new Set());
	let deleting = $state(false);
	let selectAllEl = $state<HTMLInputElement | null>(null);

	const allSelected = $derived(ideas.length > 0 && selectedIds.size === ideas.length);
	const hasSelection = $derived(selectedIds.size > 0);

	$effect(() => {
		if (selectAllEl) {
			selectAllEl.indeterminate = hasSelection && !allSelected;
		}
	});

	function toggleSelect(id: string) {
		selectedIds = new Set(selectedIds);
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
	}

	function toggleSelectAll() {
		if (allSelected) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(ideas.map((i) => i.id));
		}
	}

	async function deleteSelected() {
		if (!hasSelection) return;
		deleting = true;
		try {
			for (const id of selectedIds) {
				const idea = await pb.collection('ideas').getOne<{ analyses?: string[] }>(id, {
					fields: 'analyses'
				});
				const analysisIds = idea.analyses ?? [];
				for (const analysisId of analysisIds) {
					await pb.collection('analyses').delete(analysisId);
				}
			}
			ideas = ideas.filter((i) => !selectedIds.has(i.id));
			selectedIds = new Set();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete ideas';
		} finally {
			deleting = false;
		}
	}

	onMount(async () => {
		await checkAuth();
		try {
			const records = await pb.collection('ideas').getFullList<Idea>();
			ideas = records;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load ideas';
		} finally {
			loading = false;
		}
	});
</script>

<div class="max-w-4xl mx-auto py-12 px-4">
	<div class="flex flex-wrap items-center gap-4 mb-8">
		<h1 class="text-2xl">Your ideas</h1>
		{#if ideas.length > 0}
			<label class="flex items-center gap-2 cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
				<input
					type="checkbox"
					bind:this={selectAllEl}
					checked={allSelected}
					onchange={toggleSelectAll}
					class="rounded border-neutral-700"
					style="accent-color: var(--color-primary);"
				/>
				Select all
			</label>
		{/if}
		{#if hasSelection}
			<button
				type="button"
				onclick={deleteSelected}
				disabled={deleting}
				class="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white transition-colors"
			>
				{deleting ? 'Deleting…' : `Delete (${selectedIds.size})`}
			</button>
		{/if}
	</div>

	{#if loading}
		<p class="text-zinc-500 dark:text-zinc-400">Loading ideas...</p>
	{:else if error}
		<p class="text-red-600 dark:text-red-400">{error}</p>
	{:else if ideas.length === 0}
		<p class="text-muted">No ideas yet. <a href="/idea-new" class="text-primary hover:underline">Add one</a>.</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each ideas as idea}
				<div
					role="group"
					class="flex gap-3 p-4 rounded-xl border border-neutral-700 bg-neutral-900/50 transition-colors"
					style="--hover-border: var(--color-primary);"
					onmouseenter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
					onmouseleave={(e) => e.currentTarget.style.borderColor = ''}
				>
					<label class="flex items-start pt-0.5 shrink-0 cursor-pointer">
						<input
							type="checkbox"
							checked={selectedIds.has(idea.id)}
							onchange={() => toggleSelect(idea.id)}
							onclick={(e) => e.stopPropagation()}
							class="rounded border-neutral-700"
							style="accent-color: var(--color-primary);"
						/>
					</label>
					<button
						type="button"
						onclick={() => goto(`/idea/${idea.id}`)}
						class="flex-1 text-left min-w-0"
					>
						<h2 class="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{idea.title || 'Untitled'}</h2>
						<p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{idea.description || ''}</p>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
