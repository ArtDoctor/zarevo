<script lang="ts">
	import AnalysisSection from './AnalysisSection.svelte';
	import ScoreSpectrumBar from './ScoreSpectrumBar.svelte';
	import type { TechnicalAnalysis } from '$lib/types/technical-analysis';

	interface Props {
		data: TechnicalAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="technical-analysis">
	{#if data.overview}
		<section class="technical-analysis-block">
			<h3 class="technical-analysis-section-title">Overview</h3>
			<p class="technical-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.toughness != null}
		<section class="technical-analysis-meta">
			<div class="technical-analysis-meta-item technical-analysis-meta-item-full">
				<span class="technical-analysis-meta-label">Toughness</span>
				<ScoreSpectrumBar
					value={data.toughness}
					max={10}
					leftLabel="Easy"
					rightLabel="Hard"
				/>
			</div>
		</section>
	{/if}

	{#if data.ideal_team}
		<section class="technical-analysis-block">
			<h3 class="technical-analysis-section-title">Ideal team</h3>
			<p class="technical-analysis-prose">{data.ideal_team}</p>
		</section>
	{/if}

	{#if data.suggested_tech_stack}
		<section class="technical-analysis-block">
			<h3 class="technical-analysis-section-title">Suggested tech stack</h3>
			<p class="technical-analysis-prose">{data.suggested_tech_stack}</p>
		</section>
	{/if}

	{#if data.no_code_viability}
		<section class="technical-analysis-block">
			<h3 class="technical-analysis-section-title">No-code viability</h3>
			<p class="technical-analysis-prose">{data.no_code_viability}</p>
		</section>
	{/if}

	{#if data.scaling_considertions}
		<section class="technical-analysis-block">
			<h3 class="technical-analysis-section-title">Scaling considerations</h3>
			<p class="technical-analysis-prose">{data.scaling_considertions}</p>
		</section>
	{/if}

	<div class="technical-analysis-swot">
		<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
		<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
	</div>
</div>

<style>
	.technical-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.technical-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.technical-analysis-block {
		display: block;
	}

	.technical-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}

	.technical-analysis-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.technical-analysis-meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.technical-analysis-meta-item-full {
		flex: 1 1 100%;
	}

	.technical-analysis-meta-label {
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		color: #fff;
	}

	.technical-analysis-swot {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
	}

	@media (max-width: 640px) {
		.technical-analysis-swot {
			grid-template-columns: 1fr;
		}
	}
</style>
