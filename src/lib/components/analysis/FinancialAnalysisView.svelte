<script lang="ts">
	import AnalysisBlock from './AnalysisBlock.svelte';
	import AnalysisMeta from './AnalysisMeta.svelte';
	import AnalysisMetaItem from './AnalysisMetaItem.svelte';
	import type { FinancialAnalysis } from '$lib/types/financial-analysis';

	interface Props {
		data: FinancialAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.start_capital_needed}
		<AnalysisMeta>
			<AnalysisMetaItem label="Start capital needed" value={data.start_capital_needed} />
		</AnalysisMeta>
	{/if}

	{#if data.costs_overview}
		<AnalysisBlock title="Costs overview" content={data.costs_overview} />
	{/if}

	{#if data.investor_requirements}
		<AnalysisBlock title="Investor requirements" content={data.investor_requirements} />
	{/if}

	{#if data.investor_concerns}
		<AnalysisBlock title="Investor concerns" content={data.investor_concerns} />
	{/if}
</div>
