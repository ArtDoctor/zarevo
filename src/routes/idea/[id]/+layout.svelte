<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import ProceedIdeaModal from '$lib/components/ProceedIdeaModal.svelte';
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
	const idea = $derived(data.idea);
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

	const shouldPoll = $derived(
		idea != null &&
		idea.title &&
		idea.title !== 'none' &&
		analyses.some((a: Analysis) => a.status === 'in_progress' || a.status === 'pending')
	);

	$effect(() => {
		if (!shouldPoll) return;
		const interval = setInterval(() => invalidateAll(), 2000);
		return () => clearInterval(interval);
	});

	function getScore(a: Analysis): string | number | null {
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

	const currentAnalysisId = $derived(page.url.searchParams.get('analysis'));
	const currentAnalysis = $derived(
		analyses.find((a: Analysis) => a.id === currentAnalysisId) ?? null
	);
	const headerScore = $derived(getScore(currentAnalysis));
</script>

{#if idea}
	<div class="flex min-h-[calc(100vh-56px)] bg-neutral-800">
		<aside class="w-80 shrink-0 bg-neutral-900 flex flex-col h-[calc(100vh-56px)] pr-5">
			<nav class="flex-1 p-3 space-y-0.5 overflow-y-auto min-h-0">
				{#each navItems as item}
					{#if item.analysis}
						<a
							href="/idea/{id}?analysis={item.analysis.id}"
							class="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors {page.url.searchParams.get('analysis') === item.analysis.id
								? 'bg-neutral-800 text-white'
								: 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}"
						>
							<span>{item.label}</span>
							{#if getScoreLabel(item.analysis)}
								<span class="font-sans text-neutral-400 text-xs font-semibold">{getScoreLabel(item.analysis)}</span>
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

				<div class="space-y-2">
					<button type="button" class="w-full py-2.5 rounded-sm font-medium text-sm text-white transition-colors hover:brightness-110 cursor-pointer" style="background-color: #0CA12D" onclick={() => (showProceedModal = true)}>
						Proceed with this idea
					</button>
					<button
						type="button"
						class="w-full py-2 rounded-sm font-medium text-sm bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
						onclick={() => idea && generateIdeaPdf(idea)}
					>
						Download as PDF
					</button>
					<button type="button" class="w-full py-2 rounded-sm font-medium text-sm bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer" onclick={() => (showPromptModal = true)}>
						Show prompt
					</button>
					<button type="button" disabled class="w-full py-2 rounded-sm font-medium text-sm bg-neutral-800 text-neutral-500 cursor-not-allowed">
						Add to bundle
					</button>
				</div>
			</div>
		</aside>
		<div class="flex-1 min-w-0 flex flex-col">
			<header class="shrink-0 bg-neutral-900 px-6 py-6 flex items-start justify-between gap-4">
				<div class="min-w-0 flex-1">
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
							class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-neutral-600 bg-neutral-800 text-white text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<button type="submit" disabled={savingTitle} class="btn btn-sm btn-primary">
							{savingTitle ? 'Saving...' : 'Save'}
						</button>
						<button
							type="button"
							onclick={cancelEditTitle}
							disabled={savingTitle}
							class="px-3 py-2 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-white text-sm disabled:opacity-50"
						>
							Cancel
						</button>
					</form>
					{#if titleError}
						<p class="mt-1 text-sm text-red-400">{titleError}</p>
					{/if}
				{:else}
					<div class="flex items-center gap-2 flex-wrap">
						<h1 class="text-3xl font-normal text-white">{idea.title || 'Untitled'}</h1>
						<button
							type="button"
							onclick={startEditTitle}
							class="p-1.5 rounded text-primary hover:bg-neutral-800 transition-colors"
							title="Edit title"
							aria-label="Edit title"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
								<path d="m15 5 4 4" />
							</svg>
						</button>
					</div>
					{#if idea.description}
						<p class="mt-2 text-neutral-400 text-[0.8125rem] whitespace-pre-wrap max-w-[50%]">{idea.description}</p>
					{/if}
				{/if}
				</div>
				{#if headerScore != null}
					<div class="shrink-0 text-right">
						<span class="text-2xl font-semibold text-white">{typeof headerScore === 'number' ? headerScore.toFixed(headerScore % 1 === 0 ? 0 : 2) : headerScore}</span>
						<span class="text-sm text-neutral-500 align-super -ml-0.5">/100</span>
					</div>
				{/if}
			</header>
			<main class="flex-1 min-h-0 overflow-auto bg-neutral-800">
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
