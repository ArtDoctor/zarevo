<script lang="ts">
	import type { FinancialAnalysis } from '$lib/types/financial-analysis';

	interface Props {
		data: FinancialAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="financial-analysis">
	{#if data.overview}
		<section class="financial-analysis-block">
			<h3 class="financial-analysis-section-title">Overview</h3>
			<p class="financial-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.start_capital_needed}
		<section class="financial-analysis-meta">
			<div class="financial-analysis-meta-item">
				<span class="financial-analysis-meta-label">Start capital needed</span>
				<span class="financial-analysis-meta-value">{data.start_capital_needed}</span>
			</div>
		</section>
	{/if}

	{#if data.costs_overview}
		<section class="financial-analysis-block">
			<h3 class="financial-analysis-section-title">Costs overview</h3>
			<p class="financial-analysis-prose">{data.costs_overview}</p>
		</section>
	{/if}

	{#if data.investor_requirements}
		<section class="financial-analysis-block">
			<h3 class="financial-analysis-section-title">Investor requirements</h3>
			<p class="financial-analysis-prose">{data.investor_requirements}</p>
		</section>
	{/if}

	{#if data.investor_concerns}
		<section class="financial-analysis-block">
			<h3 class="financial-analysis-section-title">Investor concerns</h3>
			<p class="financial-analysis-prose">{data.investor_concerns}</p>
		</section>
	{/if}
</div>

<style>
	.financial-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.financial-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.financial-analysis-block {
		display: block;
	}

	.financial-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}

	.financial-analysis-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.financial-analysis-meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.financial-analysis-meta-label {
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		color: #fff;
	}

	.financial-analysis-meta-value {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 400;
		color: #fff;
	}
</style>
