<script lang="ts">
	import MarketGraph from './MarketGraph.svelte';
	import AnalysisSection from './AnalysisSection.svelte';
	import AnalysisBlock from './AnalysisBlock.svelte';
	import AnalysisMeta from './AnalysisMeta.svelte';
	import AnalysisMetaItem from './AnalysisMetaItem.svelte';
	import type { MarketAnalysis } from '$lib/types/market-analysis';

	interface Props {
		data: MarketAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.average_growth_rate || (data.sectors && data.sectors.length > 0) || data.theoretical_market_share_pct}
		<AnalysisMeta>
			{#if data.average_growth_rate}
				<AnalysisMetaItem label="Avg. growth" value={data.average_growth_rate} />
			{/if}
			{#if data.sectors && data.sectors.length > 0}
				<AnalysisMetaItem label="Sectors" value={data.sectors.join(', ')} />
			{/if}
			{#if data.theoretical_market_share_pct}
				<AnalysisMetaItem label="Theoretical market share" value={data.theoretical_market_share_pct} full />
			{/if}
		</AnalysisMeta>
	{/if}

	{#if data.markets && data.markets.length > 0}
		<section class="p-4 px-5 bg-[#1d1d1d] rounded-lg border border-[#2a2a2a]">
			<h3 class="text-xl font-semibold text-white mb-2">Markets</h3>
			<div class="flex flex-wrap gap-6">
				{#each data.markets as market}
					<MarketGraph {market} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.trends_analysis}
		<AnalysisBlock title="Trends" content={data.trends_analysis} />
	{/if}

	{#if data.why_now}
		<AnalysisBlock title="Why now" content={data.why_now} />
	{/if}

	{#if data.new_market_potential}
		<AnalysisBlock title="New market potential" content={data.new_market_potential} />
	{/if}

	<div class="grid grid-cols-1 gap-6 gap-x-8 sm:grid-cols-2">
		<div class="flex flex-col gap-6">
			<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
			<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
		</div>
		<div class="flex flex-col gap-6">
			<AnalysisSection title="Gaps & opportunities" items={data.gaps_and_opportunities ?? []} variant="neutral" />
			<AnalysisSection title="Threats" items={data.threats ?? []} variant="negative" />
		</div>
	</div>
</div>
