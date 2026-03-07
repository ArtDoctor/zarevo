<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { pb } from '$lib/pocketbase';

	type SmokeState = 'queued' | 'in_progress' | 'error' | 'done';

	interface SmokeRecord {
		id: string;
		state: SmokeState;
		error?: string;
	}

	const id = $derived(page.params.id ?? '');

	let smoke = $state<SmokeRecord | null>(null);
	let loading = $state(true);

	async function fetchSmoke(): Promise<void> {
		if (!id) return;
		try {
			const record = await pb.collection('smokes').getOne<{ state?: SmokeState; error?: string }>(id);
			smoke = {
				id,
				state: (record.state ?? 'queued') as SmokeState,
				...(record.error && { error: record.error })
			};
		} catch {
			smoke = { id, state: 'error' as const, error: 'Failed to load smoke test' };
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchSmoke();
	});

	// Poll when queued or in_progress
	$effect(() => {
		if (!smoke || (smoke.state !== 'queued' && smoke.state !== 'in_progress')) return;
		const interval = setInterval(fetchSmoke, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	{#if loading}
		<div class="flex flex-col items-center justify-center py-16">
			<svg class="size-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<p class="mt-4 text-muted">Loading...</p>
		</div>
	{:else if smoke}
		{#if smoke.state === 'queued' || smoke.state === 'in_progress'}
			<div class="flex flex-col items-center justify-center py-16">
				<svg class="size-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p class="mt-4 text-white font-medium">Building your smoke test...</p>
				<p class="mt-1 text-sm text-muted">
					{smoke.state === 'queued' ? 'Queued' : 'In progress'}
				</p>
			</div>
		{:else if smoke.state === 'error'}
			<div class="surface-card p-8 text-center">
				<p class="text-red-400 font-medium">Error</p>
				<p class="mt-2 text-muted">{smoke.error ?? 'An error occurred'}</p>
			</div>
		{:else if smoke.state === 'done'}
			<div class="surface-card p-8">
				<p class="text-white font-medium">Smoke test ready</p>
				<p class="mt-2 text-muted">Finished page content will be added later.</p>
			</div>
		{/if}
	{:else}
		<p class="text-muted">Failed to load smoke test</p>
	{/if}
</div>
