<script lang="ts">
	import AnalysisSection from './AnalysisSection.svelte';
	import AnalysisBlock from './AnalysisBlock.svelte';
	import AnalysisMeta from './AnalysisMeta.svelte';
	import AnalysisMetaItem from './AnalysisMetaItem.svelte';
	import AnalysisSwotGrid from './AnalysisSwotGrid.svelte';
	import ScoreSpectrumBar from './ScoreSpectrumBar.svelte';
	import type { ProblemAnalysis } from '$lib/types/problem-analysis';

	interface Props {
		data: ProblemAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.problem_statement}
		<AnalysisBlock title="Problem statement" content={data.problem_statement} />
	{/if}

	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.problem_frequency != null || data.problem_size != null || data.vitamin_or_painkiller != null}
		<AnalysisMeta>
			{#if data.problem_frequency != null}
				<AnalysisMetaItem label="Problem frequency" full>
					<ScoreSpectrumBar
						value={data.problem_frequency}
						max={10}
						leftLabel="Rare"
						rightLabel="Frequent"
					/>
				</AnalysisMetaItem>
			{/if}
			{#if data.problem_size != null}
				<AnalysisMetaItem label="Problem size" full>
					<ScoreSpectrumBar
						value={data.problem_size}
						max={10}
						leftLabel="Small"
						rightLabel="Large"
					/>
				</AnalysisMetaItem>
			{/if}
			{#if data.vitamin_or_painkiller != null}
				<AnalysisMetaItem label="Vitamin vs painkiller" full>
					<ScoreSpectrumBar
						value={data.vitamin_or_painkiller}
						max={10}
						leftLabel="Vitamin"
						rightLabel="Painkiller"
					/>
				</AnalysisMetaItem>
			{/if}
		</AnalysisMeta>
	{/if}

	{#if data.alternative_solutions}
		<AnalysisBlock title="Alternative solutions" content={data.alternative_solutions} />
	{/if}

	{#if data.related_problems}
		<AnalysisBlock title="Related problems" content={data.related_problems} />
	{/if}

	<AnalysisSwotGrid>
		<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
		<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
	</AnalysisSwotGrid>
</div>
