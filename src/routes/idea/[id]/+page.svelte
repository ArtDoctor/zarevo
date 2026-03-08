<script lang="ts">
	import { page } from '$app/state';
	import CompetitorAnalysisView from '$lib/components/CompetitorAnalysisView.svelte';
	import CustomerAnalysisView from '$lib/components/CustomerAnalysisView.svelte';
	import FinancialAnalysisView from '$lib/components/FinancialAnalysisView.svelte';
	import LegalAnalysisView from '$lib/components/LegalAnalysisView.svelte';
	import MarketAnalysisView from '$lib/components/MarketAnalysisView.svelte';
	import ProblemAnalysisView from '$lib/components/ProblemAnalysisView.svelte';
	import TechnicalAnalysisView from '$lib/components/TechnicalAnalysisView.svelte';
	import { isCompetitorAnalysis } from '$lib/types/competitor-analysis';
	import { isCustomerAnalysis } from '$lib/types/customer-analysis';
	import { isFinancialAnalysis } from '$lib/types/financial-analysis';
	import { isLegalAnalysis } from '$lib/types/legal-analysis';
	import { isMarketAnalysis } from '$lib/types/market-analysis';
	import { isProblemAnalysis } from '$lib/types/problem-analysis';
	import { isTechnicalAnalysis } from '$lib/types/technical-analysis';

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
	const customerData = $derived(
		analysisType === 'customer' && analysis?.result != null && isCustomerAnalysis(analysis.result)
			? analysis.result
			: null
	);
	const competitorData = $derived(
		analysisType === 'competitor' && analysis?.result != null && isCompetitorAnalysis(analysis.result)
			? analysis.result
			: null
	);
	const technicalData = $derived(
		analysisType === 'technical' && analysis?.result != null && isTechnicalAnalysis(analysis.result)
			? analysis.result
			: null
	);
	const legalData = $derived(
		analysisType === 'legal' && analysis?.result != null && isLegalAnalysis(analysis.result)
			? analysis.result
			: null
	);
	const financialData = $derived(
		analysisType === 'financial' && analysis?.result != null && isFinancialAnalysis(analysis.result)
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
				{:else if customerData}
					<CustomerAnalysisView data={customerData} />
				{:else if competitorData}
					<CompetitorAnalysisView data={competitorData} />
				{:else if technicalData}
					<TechnicalAnalysisView data={technicalData} />
				{:else if legalData}
					<LegalAnalysisView data={legalData} />
				{:else if financialData}
					<FinancialAnalysisView data={financialData} />
				{:else}
					<pre class="p-4 rounded-xl text-sm text-neutral-300 overflow-x-auto font-mono" style="background-color: #1C1C1C">{JSON.stringify(analysis.result, null, 2)}</pre>
				{/if}
			{:else}
				<p class="text-sm text-neutral-400">No result yet</p>
			{/if}
		</div>
	{/if}
</div>
