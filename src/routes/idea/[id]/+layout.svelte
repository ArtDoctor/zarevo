<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import ProceedIdeaModal from '$lib/components/ProceedIdeaModal.svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { generateIdeaPdf } from '$lib/pdf-report';

	interface Analysis {
		id: string;
		status: string;
		type: string;
		result: unknown;
	}

	interface IdeaFeature {
		title: string;
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

	interface SmokeRecord {
		id: string;
		state: string;
		start_date?: string;
		duration?: number;
	}

	async function fetchIdea(ideaId: string): Promise<Idea | null> {
		try {
			return await pb.collection('ideas').getOne<Idea>(ideaId, { expand: 'analyses' });
		} catch {
			return null;
		}
	}

	const NAV_ORDER = [
		'market',
		'problem',
		'customer',
		'competitor',
		'technical',
		'legal',
		'financial',
		'swot',
		'brainstorm',
		'chat_with_idea',
		'summary'
	] as const;

	let { data, children } = $props<{
		data: { idea: Idea | null; runningSmoke: SmokeRecord | null };
		children: import('svelte').Snippet;
	}>();

	const id = $derived(page.params.id);
	let polledIdea = $state<Idea | null>(null);

	$effect(() => {
		const currentId = id;
		return () => {
			polledIdea = null;
		};
	});

	const idea = $derived(polledIdea ?? data.idea);

	const ideaStore = writable<Idea | null>(null);
	setContext('idea', ideaStore);
	$effect(() => {
		ideaStore.set(idea);
	});
	const runningSmoke = $derived(data.runningSmoke);
	const analyses = $derived(idea?.expand?.analyses ?? []);
	const canBuildSmokeTest = $derived(
		idea != null &&
		Array.isArray(idea.features) &&
		idea.features.length > 0 &&
		idea.features.every(
			(f: IdeaFeature) =>
				typeof f === 'object' &&
				f != null &&
				typeof (f as IdeaFeature).title === 'string' &&
				typeof (f as IdeaFeature).expected_signup_increase_pct === 'number'
		)
	);

	const currentAnalysisId = $derived(page.url.searchParams.get('analysis'));
	const currentAnalysis = $derived(
		analyses.find((a: Analysis) => a.id === currentAnalysisId) ?? null
	);

	const shouldPoll = $derived(
		idea != null &&
		idea.title &&
		idea.title !== 'none' &&
		(
			analyses.some((a: Analysis) => a.status === 'in_progress' || a.status === 'pending') ||
			(currentAnalysis != null && currentAnalysis.result == null)
		)
	);

	$effect(() => {
		if (!shouldPoll || !id) return;
		const ideaId = id;
		const poll = async () => {
			const fresh = await fetchIdea(ideaId);
			if (fresh) polledIdea = fresh;
		};
		poll();
		const interval = setInterval(poll, 2000);
		return () => clearInterval(interval);
	});

	function getScore(a: Analysis): string | number | null {
		const typeKey = (a.type ?? '').toLowerCase().replace(/\s+/g, '_');
		if (typeKey === 'financial') return null;
		const r = a.result as Record<string, unknown> | null;
		if (!r || typeof r !== 'object') return null;
		if (typeof r.score === 'number') return r.score;
		if (r.technical !== undefined) return String(r.technical);
		if (r.legal !== undefined) return String(r.legal);
		if (r.financial !== undefined) return String(r.financial);
		return null;
	}

	function getScoreLabel(a: Analysis): string {
		const score = getScore(a);
		if (score === null) return '';
		return typeof score === 'number' ? String(score) : score;
	}

	type ScoreStatus = { label: 'Valid'; variant: 'valid' } | { label: 'Problematic'; variant: 'problematic' } | { label: 'Risky'; variant: 'risky' } | null;
	function getScoreStatus(score: string | number | null): ScoreStatus {
		const n = typeof score === 'number' ? score : typeof score === 'string' ? parseFloat(score) : NaN;
		if (Number.isNaN(n)) return null;
		if (n > 80) return { label: 'Valid', variant: 'valid' };
		if (n >= 60) return { label: 'Problematic', variant: 'problematic' };
		return { label: 'Risky', variant: 'risky' };
	}

	const navItems = $derived.by(() => {
		const byType = new Map<string, Analysis>();
		for (const a of analyses) {
			byType.set((a.type ?? '').toLowerCase().replace(/\s+/g, '_'), a);
		}
		const ordered: { type: string; label: string; analysis: Analysis | null }[] = [];
		for (const t of NAV_ORDER) {
			const a = byType.get(t) ?? byType.get(t.replace(/_/g, ' '));
			ordered.push({
				type: t,
				label: t.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
				analysis: a ?? null
			});
		}
		for (const a of analyses) {
			const key = (a.type ?? '').toLowerCase().replace(/\s+/g, '_');
			if (!NAV_ORDER.includes(key as (typeof NAV_ORDER)[number])) {
				ordered.push({
					type: key,
					label: (a.type ?? 'unknown').replace(/\b\w/g, (c: string) => c.toUpperCase()),
					analysis: a
				});
			}
		}
		return ordered;
	});

	const smokeProgress = $derived.by(() => {
		const s = runningSmoke;
		if (!s?.start_date || (s.duration ?? 0) <= 0) return null;
		const start = new Date(s.start_date);
		const end = new Date(start);
		end.setDate(end.getDate() + s.duration);
		const now = new Date();
		if (now < start || now > end) return null;
		const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
		const progress = Math.min(100, (elapsed / s.duration) * 100);
		const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return { progress, daysLeft };
	});

	let showPromptModal = $state(false);
	let showProceedModal = $state(false);
	let editingTitle = $state(false);
	let editTitleValue = $state('');
	let savingTitle = $state(false);
	let titleError = $state<string | null>(null);

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
		if (!idea?.id) return;
		savingTitle = true;
		titleError = null;
		try {
			await pb.collection('ideas').update(idea.id, { title: editTitleValue.trim() });
			editingTitle = false;
			editTitleValue = '';
			await invalidateAll();
		} catch (e) {
			titleError = e instanceof Error ? e.message : 'Failed to update title';
		} finally {
			savingTitle = false;
		}
	}
	const userInputSections = $derived([
		{ label: 'Idea description', value: idea?.description ?? '' },
		{ label: 'Problem', value: idea?.problem ?? '' },
		{ label: 'Customer', value: idea?.customer ?? '' },
		{ label: 'Founder specific', value: idea?.founder_specific ?? '' }
	]);

	const headerScore = $derived(currentAnalysis ? getScore(currentAnalysis) : null);

	const isSmokeTestPage = $derived(page.url.pathname.endsWith('/smoke-test'));
</script>

{#if idea && isSmokeTestPage}
	<div class="min-h-[calc(100vh-65px)] bg-neutral-800">
		{@render children()}
	</div>
{:else if id}
	<div class="flex h-[calc(100vh-65px)] overflow-hidden bg-neutral-800">
		<aside class="w-80 shrink-0 bg-neutral-900 flex flex-col h-full pr-5 overflow-hidden">
			<nav class="flex-1 p-3 space-y-0.5 min-h-0 overflow-hidden">
				{#each navItems as item}
					{#if item.analysis}
						<a
							href="/idea/{id}?analysis={item.analysis.id}"
							class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors {page.url.searchParams.get('analysis') === item.analysis.id
								? 'bg-neutral-800 text-white'
								: 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}"
						>
							<span>{item.label}</span>
							{#if getScoreLabel(item.analysis)}
								<span class="font-sans text-neutral-400 text-xs font-semibold">{getScoreLabel(item.analysis)}</span>
							{:else if item.analysis.result == null}
								<Skeleton class="h-4 w-8 shrink-0" />
							{/if}
						</a>
					{/if}
				{/each}
			</nav>

			<div class="shrink-0 p-3 border-t border-neutral-800 space-y-3 mt-auto">
				{#if runningSmoke && smokeProgress}
					<div>
						<p class="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Smoke test</p>
						<div class="flex items-center gap-2 mb-1">
							<div class="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
								<div class="h-full bg-primary rounded-full transition-all" style="width: {smokeProgress.progress}%"></div>
							</div>
							<span class="text-xs text-neutral-400">{smokeProgress.daysLeft} day{smokeProgress.daysLeft === 1 ? '' : 's'} left</span>
						</div>
						<a href="/smokes/stats/{runningSmoke.id}" class="text-xs text-primary hover:underline">View results →</a>
					</div>
				{/if}

				{#if idea}
			<div class="space-y-2">
					<Button
						type="button"
						variant="primary"
						color="orange"
						size="lg"
						class="w-full !bg-[#0CA12D] hover:!brightness-110"
						onclick={() => (showProceedModal = true)}
					>
						Proceed with this idea
					</Button>
					<Button
						type="button"
						variant="normal"
						color="grey"
						size="md"
						class="w-full"
						onclick={() => generateIdeaPdf(idea)}
					>
						Download as PDF
					</Button>
					<Button
						type="button"
						variant="normal"
						color="grey"
						size="md"
						class="w-full"
						onclick={() => (showPromptModal = true)}
					>
						Show prompt
					</Button>
					<Button type="button" variant="normal" color="grey" size="md" class="w-full" disabled>
						Add to bundle
					</Button>
				</div>
			{/if}
			</div>
		</aside>
		<div class="flex-1 min-w-0 flex flex-col bg-neutral-900">
			<header class="shrink-0 bg-neutral-900 px-6 py-6 flex items-center justify-between gap-4">
				<div class="min-w-0 flex-1">
				{#if editingTitle}
					<form
						onsubmit={(e) => {
							e.preventDefault();
							saveTitle();
						}}
						class="flex flex-wrap items-center gap-2"
					>
						<Field
							type="input"
							bind:value={editTitleValue}
							placeholder="Idea title"
							class="flex-1 min-w-[200px] text-2xl font-semibold"
						/>
						<Button type="submit" variant="primary" size="sm" disabled={savingTitle}>
							{savingTitle ? 'Saving...' : 'Save'}
						</Button>
						<Button
							type="button"
							variant="normal"
							color="grey"
							size="sm"
							onclick={cancelEditTitle}
							disabled={savingTitle}
						>
							Cancel
						</Button>
					</form>
					{#if titleError}
						<p class="mt-1 text-sm text-red-400">{titleError}</p>
					{/if}
				{:else}
					<div class="flex items-center gap-2 flex-wrap">
						{#if idea?.title}
							<h1 class="text-3xl font-normal text-white">{idea.title}</h1>
						{:else}
							<Skeleton class="h-9 w-64" />
						{/if}
						{#if idea}
						<Button
							type="button"
							variant="icon"
							color="grey"
							size="sm"
							onclick={startEditTitle}
							title="Edit title"
							aria-label="Edit title"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
								<path d="m15 5 4 4" />
							</svg>
						</Button>
						{/if}
					</div>
					{#if idea?.description}
						<p class="mt-2 text-neutral-400 text-[0.8125rem] whitespace-pre-wrap max-w-[50%]">{idea.description}</p>
					{/if}
				{/if}
				</div>
				{#if currentAnalysis}
					{@const isFinancial = (currentAnalysis.type ?? '').toLowerCase().replace(/\s+/g, '_') === 'financial'}
					{#if !isFinancial}
					<div class="shrink-0 flex items-center gap-4 justify-end">
						{#if headerScore != null}
							{@const headerStatus = getScoreStatus(headerScore)}
							{#if headerStatus}
								<span
									class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border {headerStatus.variant ===
									'valid'
										? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
										: headerStatus.variant === 'problematic'
											? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
											: 'bg-red-500/20 text-red-400 border-red-500/40'}"
								>
									{#if headerStatus.variant === 'valid'}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
									{:else if headerStatus.variant === 'problematic'}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
									{/if}
									{headerStatus.label}
								</span>
							{/if}
							<div class="text-right">
								<span class="text-2xl font-semibold text-white">{typeof headerScore === 'number' ? headerScore.toFixed(headerScore % 1 === 0 ? 0 : 2) : headerScore}</span>
								<span class="text-sm text-neutral-500 align-super -ml-0.5">/100</span>
							</div>
						{:else}
							<Skeleton class="h-6 w-16 rounded-full" />
							<div class="flex items-baseline gap-1">
								<Skeleton class="h-8 w-14" />
								<span class="text-sm text-neutral-500">/100</span>
							</div>
						{/if}
					</div>
					{/if}
				{/if}
			</header>
			<main class="flex-1 min-h-0 overflow-auto bg-neutral-800 rounded-tl-xl rounded-tr-xl mt-2 ml-2 mr-2">
				{@render children()}
			</main>
		</div>
	</div>

	{#if showPromptModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			role="button"
			tabindex="0"
			onclick={() => (showPromptModal = false)}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPromptModal = false; } }}
		>
			<div
				class="bg-neutral-900 border border-neutral-700 rounded-md shadow-xl max-w-2xl max-h-[80vh] overflow-hidden flex flex-col mx-4"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="prompt-modal-title"
				tabindex="-1"
			>
				<div class="p-6 border-b border-neutral-700">
					<h2 id="prompt-modal-title" class="text-lg font-semibold text-white">Overview</h2>
					<p class="mt-1 text-sm text-neutral-400">All user inputs for this idea</p>
				</div>
				<div class="p-6 overflow-y-auto flex-1 space-y-6">
					{#each userInputSections as { label, value }}
						<div>
							<h3 class="text-sm font-semibold text-white mb-1.5">{label}</h3>
							{#if value}
								<p class="text-sm text-neutral-400 whitespace-pre-wrap">{value}</p>
							{:else}
								<p class="text-sm text-neutral-500 italic">—</p>
							{/if}
						</div>
					{/each}
				</div>
				<div class="p-6 border-t border-neutral-700">
					<button
						type="button"
						onclick={() => (showPromptModal = false)}
						class="w-full py-2 rounded-sm font-medium text-sm bg-neutral-700 hover:bg-neutral-600 text-white transition-colors cursor-pointer"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}

	<ProceedIdeaModal
		open={showProceedModal}
		ideaId={id}
		canBuildSmokeTest={canBuildSmokeTest}
		onclose={() => (showProceedModal = false)}
	/>
{:else}
	{@render children()}
{/if}
