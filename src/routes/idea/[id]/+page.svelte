<script lang="ts">
	import { page } from '$app/state';
	import MarketAnalysisView from '$lib/components/MarketAnalysisView.svelte';
	import ProblemAnalysisView from '$lib/components/ProblemAnalysisView.svelte';
	import { isMarketAnalysis } from '$lib/types/market-analysis';
	import { isProblemAnalysis } from '$lib/types/problem-analysis';

	interface Analysis {
		id: string;
		status: string;
		type: string;
		result: unknown;
	}

	interface Idea {
		id: string;
		expand?: { analyses?: Analysis[] };
	}

	let { data } = $props<{ data: { idea: Idea | null } }>();

	const id = $derived(page.params.id);
	const analysisId = $derived(page.url.searchParams.get('analysis'));
	const idea = $derived(data.idea);
	const analysis = $derived(
		idea?.expand?.analyses?.find((a: { id: string }) => a.id === analysisId) ?? null
	);

	const analysisType = $derived(
		(analysis?.type ?? '').toLowerCase().replace(/\s+/g, '_')
	);
	const marketData = $derived(
		analysisType === 'market' && analysis?.result != null && isMarketAnalysis(analysis.result)
			? analysis.result
			: null
	);
	const problemData = $derived(
		analysisType === 'problem' && analysis?.result != null && isProblemAnalysis(analysis.result)
			? analysis.result
			: null
	);
</script>

<div class="min-h-full py-8 px-[3.6rem] lg:px-[4.8rem]">
	{#if !idea}
		<p class="text-neutral-400">Loading...</p>
	{:else if !analysisId}
		<p class="text-neutral-400">Select an analysis from the sidebar</p>
	{:else if !analysis}
		<p class="text-red-400">Analysis not found</p>
	{:else}
		<div class="max-w-4xl mx-auto">
			{#if analysis.result != null}
				{#if marketData}
					<MarketAnalysisView data={marketData} />
				{:else if problemData}
					<ProblemAnalysisView data={problemData} />
				{:else}
					<pre class="p-4 rounded-xl text-sm text-neutral-300 overflow-x-auto font-mono" style="background-color: #1C1C1C">{JSON.stringify(analysis.result, null, 2)}</pre>
				{/if}
			{:else}
				<p class="text-sm text-neutral-400">No result yet</p>
			{/if}
		</div>
	{/if}
</div>
