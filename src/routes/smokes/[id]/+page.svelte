<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { getBackendUrl } from '$lib/config';
	import { getAuthHeaders } from '$lib/pocketbase';
	import { getContent, buildSmokeHtml } from '$lib/smoke-html';

	type SmokeState = 'queued' | 'in_progress' | 'error' | 'done';

	interface SmokeRecord {
		id: string;
		state: SmokeState;
		error?: string;
	}

	const ADS_CHANNELS = [
		{ id: 'google', label: 'Google Ads' },
		{ id: 'meta', label: 'Meta Ads' }
	] as const;

	const id = $derived(page.params.id ?? '');

	let smoke = $state<SmokeRecord | null>(null);
	let loading = $state(true);
	let subdomain = $state('');
	let duration = $state(7);
	let deploying = $state(false);
	let deployError = $state<string | null>(null);
	let showAdsWipPopup = $state(false);

	const creditPrice = $derived(Math.ceil(duration / 3));

	let smokeHtml = $state<string | null>(null);

	async function fetchSmoke(): Promise<void> {
		if (!id) return;
		try {
			const record = await pb.collection('smokes').getOne<Record<string, unknown> & { state?: SmokeState; error?: string }>(id);
			smoke = {
				id,
				state: (record.state ?? 'queued') as SmokeState,
				...(record.error && { error: record.error })
			};
			const html = getContent(record);
			smokeHtml = html ? buildSmokeHtml(html) : null;
		} catch {
			smoke = { id, state: 'error' as const, error: 'Failed to load smoke test' };
			smokeHtml = null;
		} finally {
			loading = false;
		}
	}

	function onAdChannelClick() {
		showAdsWipPopup = true;
	}

	function openPreviewInNewTab() {
		if (!smokeHtml) return;
		const url = URL.createObjectURL(new Blob([smokeHtml], { type: 'text/html' }));
		window.open(url, '_blank', 'noopener,noreferrer');
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	async function deploy() {
		if (!id || !subdomain.trim()) return;
		deployError = null;
		deploying = true;
		try {
			const trimmed = subdomain.trim();
			const existing = await pb.collection('smokes').getList<{ id: string; domain?: string }>(1, 1, {
				filter: `domain = "${trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
			});
			if (existing.totalItems > 0 && existing.items[0].id !== id) {
				throw new Error('Domain already taken');
			}

			const backendUrl = getBackendUrl();
			if (!backendUrl) {
				throw new Error('Backend URL is not configured');
			}
			const ads_channels = ADS_CHANNELS.map((ch) => ({
				channel: ch.id,
				advertised: 'no'
			}));
			const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/smokes/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
				body: JSON.stringify({
					smoke_id: id,
					start_date: new Date().toISOString().split('T')[0],
					duration,
					subdomain: trimmed,
					ads_channels
				})
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `Failed to publish: ${res.status}`);
			}
			goto(`/smokes/stats/${id}`);
		} catch (e) {
			deployError = e instanceof Error ? e.message : 'Failed to deploy';
		} finally {
			deploying = false;
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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showAdsWipPopup) showAdsWipPopup = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

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
			<div class="surface-card p-8 text-center space-y-4">
				<p class="text-red-400 font-medium">Error</p>
				<p class="mt-2 text-muted">{smoke.error ?? 'An error occurred'}</p>
			</div>
		{:else if smoke.state === 'done'}
			<div class="surface-card p-8 space-y-6">
				<div>
					<p class="text-white font-medium">Smoke test ready</p>
					<p class="mt-1 text-muted">Deploy your smoke test to start collecting traffic.</p>
				</div>

				{#if smokeHtml}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium text-white">Preview</p>
							<button
								type="button"
								onclick={openPreviewInNewTab}
								class="text-xs text-primary hover:underline"
							>
								Open in new tab
							</button>
						</div>
						<div class="rounded-lg border border-neutral-600 bg-neutral-900 overflow-hidden">
							<iframe
								title="Smoke test preview"
								srcdoc={smokeHtml}
								sandbox="allow-same-origin allow-scripts"
								class="w-full h-[280px] block border-0"
							></iframe>
						</div>
						<p class="text-xs text-muted">Scroll inside the preview or open in new tab to view full page</p>
					</div>
				{/if}

				<form class="space-y-6" onsubmit={(e) => { e.preventDefault(); deploy(); }}>
					<div>
						<label for="subdomain" class="block text-sm font-medium text-white mb-2">Subdomain</label>
						<div class="flex items-center gap-2">
							<input
								id="subdomain"
								type="text"
								bind:value={subdomain}
								placeholder="myapp"
								class="flex-1 px-3 py-2 rounded-md border border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
							/>
							<span class="text-sm text-muted">.zarevo.yazero.io</span>
						</div>
						<p class="mt-1 text-xs text-muted">Or .localhost for local testing</p>
					</div>

					<div>
						<label for="duration" class="block text-sm font-medium text-white mb-2">Duration: {duration} days</label>
						<input
							id="duration"
							type="range"
							min="3"
							max="90"
							step="3"
							bind:value={duration}
							class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-neutral-700 accent-primary"
						/>
						<div class="flex justify-between text-xs text-muted mt-1">
							<span>3 days</span>
							<span>90 days</span>
						</div>
					</div>

					<div>
						<span class="block text-sm font-medium text-white mb-2">Ad channels</span>
						<div class="flex flex-wrap gap-2" role="group" aria-label="Ad channels">
							{#each ADS_CHANNELS as ch}
								<button
									type="button"
									onclick={onAdChannelClick}
									class="px-3 py-1.5 rounded-md border border-neutral-600 bg-neutral-800 text-muted hover:bg-neutral-700 text-sm transition-colors cursor-pointer"
								>
									{ch.label}
								</button>
							{/each}
						</div>
						<p class="mt-1 text-xs text-muted">Coming soon</p>
					</div>

					<div class="rounded-md border border-neutral-600 bg-neutral-800/50 px-4 py-3">
						<p class="text-sm text-muted">Credit cost</p>
						<p class="text-xl font-semibold text-primary">{creditPrice} credits</p>
						<p class="text-xs text-muted mt-1">
							1 credit per 3 days base ({Math.ceil(duration / 3)})
						</p>
					</div>

					{#if deployError}
						<p class="text-red-400 text-sm">{deployError}</p>
					{/if}

					<button
						type="submit"
						disabled={deploying || !subdomain.trim()}
						class="btn btn-lg btn-primary w-full"
					>
						{#if deploying}
							<span class="inline-flex items-center gap-2">
								<svg class="size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Deploying...
							</span>
						{:else}
							Deploy
						{/if}
					</button>
				</form>
			</div>
		{/if}
	{:else}
		<p class="text-muted">Failed to load smoke test</p>
	{/if}
</div>

{#if showAdsWipPopup}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
		role="button"
		tabindex="0"
		onclick={() => (showAdsWipPopup = false)}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showAdsWipPopup = false; } }}
	>
		<div
			class="surface-card p-6 max-w-sm mx-4 rounded-lg shadow-xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => { if (e.key !== 'Escape') e.stopPropagation(); else showAdsWipPopup = false; }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="wip-title"
			tabindex="-1"
		>
			<p id="wip-title" class="text-white font-medium">SEO ads</p>
			<p class="mt-2 text-muted text-sm">Work in progress. Coming soon.</p>
			<button
				type="button"
				onclick={() => (showAdsWipPopup = false)}
				class="mt-4 btn btn-primary w-full"
			>
				OK
			</button>
		</div>
	</div>
{/if}
