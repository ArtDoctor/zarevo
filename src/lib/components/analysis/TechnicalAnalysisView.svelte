<script lang="ts">
	import AnalysisSection from './AnalysisSection.svelte';
	import AnalysisBlock from './AnalysisBlock.svelte';
	import AnalysisMeta from './AnalysisMeta.svelte';
	import AnalysisMetaItem from './AnalysisMetaItem.svelte';
	import AnalysisSwotGrid from './AnalysisSwotGrid.svelte';
	import ScoreSpectrumBar from './ScoreSpectrumBar.svelte';
	import type { TechnicalAnalysis } from '$lib/types/technical-analysis';

	interface Props {
		data: TechnicalAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.toughness != null}
		<AnalysisMeta>
			<AnalysisMetaItem label="Toughness" full>
				<ScoreSpectrumBar
					value={data.toughness}
					max={10}
					leftLabel="Easy"
					rightLabel="Hard"
				/>
			</AnalysisMetaItem>
		</AnalysisMeta>
	{/if}

	{#if data.ideal_team}
		<AnalysisBlock title="Ideal team" content={data.ideal_team} />
	{/if}

	{#if data.suggested_tech_stack}
		<AnalysisBlock title="Suggested tech stack" content={data.suggested_tech_stack} />
	{/if}

	{#if data.no_code_viability}
		<AnalysisBlock title="No-code viability" content={data.no_code_viability} />
	{/if}

	{#if data.scaling_considertions}
		<AnalysisBlock title="Scaling considerations" content={data.scaling_considertions} />
	{/if}

	<AnalysisSwotGrid>
		<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
		<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
	</AnalysisSwotGrid>
</div>
