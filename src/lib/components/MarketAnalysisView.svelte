<script lang="ts">
	import MarketGraph from './MarketGraph.svelte';
	import AnalysisSection from './AnalysisSection.svelte';
	import type { MarketAnalysis } from '$lib/types/market-analysis';

	interface Props {
		data: MarketAnalysis;
	}

	let { data }: Props = $props();

</script>

<div class="market-analysis">
	{#if data.overview}
		<section class="market-analysis-block">
			<h3 class="market-analysis-section-title">Overview</h3>
			<p class="market-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.average_growth_rate || (data.sectors && data.sectors.length > 0)}
		<section class="market-analysis-meta">
			{#if data.average_growth_rate}
				<div class="market-analysis-meta-item">
					<span class="market-analysis-meta-label">Avg. growth</span>
					<span class="market-analysis-meta-value">{data.average_growth_rate}</span>
				</div>
			{/if}
			{#if data.sectors && data.sectors.length > 0}
				<div class="market-analysis-meta-item">
					<span class="market-analysis-meta-label">Sectors</span>
					<span class="market-analysis-meta-value">{data.sectors.join(', ')}</span>
				</div>
			{/if}
			{#if data.theoretical_market_share_pct}
				<div class="market-analysis-meta-item market-analysis-meta-item-full">
					<span class="market-analysis-meta-label">Theoretical market share</span>
					<span class="market-analysis-meta-value">{data.theoretical_market_share_pct}</span>
				</div>
			{/if}
		</section>
	{/if}

	{#if data.markets && data.markets.length > 0}
		<section class="market-analysis-graph">
			<h3 class="market-analysis-section-title">Markets</h3>
			<div class="market-analysis-graphs">
				{#each data.markets as market}
					<MarketGraph market={market} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.trends_analysis}
		<section class="market-analysis-block">
			<h3 class="market-analysis-section-title">Trends</h3>
			<p class="market-analysis-prose">{data.trends_analysis}</p>
		</section>
	{/if}

	{#if data.why_now}
		<section class="market-analysis-block">
			<h3 class="market-analysis-section-title">Why now</h3>
			<p class="market-analysis-prose">{data.why_now}</p>
		</section>
	{/if}

	{#if data.new_market_potential}
		<section class="market-analysis-block">
			<h3 class="market-analysis-section-title">New market potential</h3>
			<p class="market-analysis-prose">{data.new_market_potential}</p>
		</section>
	{/if}

	<div class="market-analysis-swot">
		<div class="market-analysis-swot-column">
			<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
			<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
		</div>
		<div class="market-analysis-swot-column">
			<AnalysisSection title="Gaps & opportunities" items={data.gaps_and_opportunities ?? []} variant="neutral" />
			<AnalysisSection title="Threats" items={data.threats ?? []} variant="negative" />
		</div>
	</div>
</div>

<style>
	.market-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.market-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.market-analysis-block {
		display: block;
	}

	.market-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}

	.market-analysis-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.market-analysis-meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.market-analysis-meta-item-full {
		flex: 1 1 100%;
	}

	.market-analysis-meta-label {
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		color: #fff;
	}

	.market-analysis-meta-value {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 400;
		color: #fff;
	}

	.market-analysis-graph {
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.market-analysis-graphs {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.market-analysis-swot {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
	}

	@media (max-width: 640px) {
		.market-analysis-swot {
			grid-template-columns: 1fr;
		}
	}

	.market-analysis-swot-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
</style>
