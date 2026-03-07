<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { pb } from '$lib/pocketbase';

	interface AdChannel {
		channel: string;
		advertised: string;
	}

	interface SmokeStatsRecord {
		visits?: number;
		smokes?: number;
		ad_channels?: AdChannel[];
		duration?: number;
		start_date?: string;
		domain?: string;
		subdomain?: string;
	}

	const id = $derived(page.params.id ?? '');

	let record = $state<SmokeStatsRecord | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const endDate = $derived.by(() => {
		if (!record?.start_date || record.duration == null) return null;
		const start = new Date(record.start_date);
		const end = new Date(start);
		end.setDate(end.getDate() + record.duration);
		return end;
	});

	const advertisedChannels = $derived(
		(record?.ad_channels ?? []).filter((c) => c.advertised === 'yes').map((c) => c.channel)
	);

	const domainUrl = $derived.by(() => {
		const sub = record?.domain ?? record?.subdomain;
		if (!sub || typeof window === 'undefined') return null;
		const protocol = window.location.protocol;
		const hostname = window.location.hostname;
		const port = window.location.port;
		const baseHost = hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname.replace(/^www\./, '');
		const fullHost = `${sub}.${baseHost}`;
		const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : '';
		return `${protocol}//${fullHost}${portSuffix}`;
	});

	function formatDate(d: Date | string | null): string {
		if (!d) return '—';
		const date = typeof d === 'string' ? new Date(d) : d;
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function fetchStats(): Promise<void> {
		if (!id) return;
		try {
			const r = await pb.collection('smokes').getOne<SmokeStatsRecord>(id);
			record = {
				visits: r.visits ?? 0,
				smokes: r.smokes ?? 0,
				ad_channels: (r.ad_channels ?? []) as AdChannel[],
				duration: r.duration ?? 0,
				start_date: r.start_date,
				domain: r.domain,
				subdomain: r.subdomain
			};
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load stats';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchStats();
	});
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	<a
		href="/your-ideas"
		class="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-6"
	>
		← Back to your ideas
	</a>

	<h1 class="text-2xl font-semibold text-white mb-8">Smoke test stats</h1>

	{#if loading}
		<div class="flex flex-col items-center justify-center py-16">
			<svg class="size-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<p class="mt-4 text-muted">Loading...</p>
		</div>
	{:else if error}
		<div class="surface-card p-8 text-center">
			<p class="text-red-400 font-medium">Error</p>
			<p class="mt-2 text-muted">{error}</p>
		</div>
	{:else if record}
		<div class="surface-card p-8 space-y-6">
			{#if domainUrl}
				<div>
					<p class="text-sm font-medium text-muted mb-2">Domain</p>
					<a
						href={domainUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline break-all"
					>
						{domainUrl}
					</a>
				</div>
			{/if}
			<div class="grid grid-cols-2 gap-4">
				<div class="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4">
					<p class="text-sm text-muted">Visits</p>
					<p class="text-2xl font-semibold text-white">{record.visits ?? 0}</p>
				</div>
				<div class="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4">
					<p class="text-sm text-muted">Smokes</p>
					<p class="text-2xl font-semibold text-white">{record.smokes ?? 0}</p>
				</div>
			</div>

			<div>
				<p class="text-sm font-medium text-muted mb-2">Ad channels</p>
				{#if advertisedChannels.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each advertisedChannels as ch}
							<span class="px-3 py-1 rounded-md border border-primary bg-primary/20 text-primary text-sm capitalize">
								{ch}
							</span>
						{/each}
					</div>
				{:else}
					<p class="text-muted">None</p>
				{/if}
			</div>

			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted">Duration</span>
					<span class="text-white">{record.duration ?? 0} days</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-muted">Start date</span>
					<span class="text-white">{formatDate(record.start_date ?? null)}</span>
				</div>
				<div class="flex justify-between text-sm">
					<span class="text-muted">End date</span>
					<span class="text-white">{formatDate(endDate)}</span>
				</div>
			</div>
		</div>
	{:else}
		<p class="text-muted">No stats found</p>
	{/if}
</div>
