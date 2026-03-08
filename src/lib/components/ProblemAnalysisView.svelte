<script lang="ts">
	import AnalysisSection from './AnalysisSection.svelte';
	import ScoreSpectrumBar from './ScoreSpectrumBar.svelte';
	import type { ProblemAnalysis } from '$lib/types/problem-analysis';

	interface Props {
		data: ProblemAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="problem-analysis">
	{#if data.problem_statement}
		<section class="problem-analysis-block">
			<h3 class="problem-analysis-section-title">Problem statement</h3>
			<p class="problem-analysis-prose">{data.problem_statement}</p>
		</section>
	{/if}

	{#if data.overview}
		<section class="problem-analysis-block">
			<h3 class="problem-analysis-section-title">Overview</h3>
			<p class="problem-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.problem_frequency != null || data.problem_size != null || data.vitamin_or_painkiller != null}
		<section class="problem-analysis-meta">
			{#if data.problem_frequency != null}
				<div class="problem-analysis-meta-item problem-analysis-meta-item-full">
					<span class="problem-analysis-meta-label">Problem frequency</span>
					<ScoreSpectrumBar
						value={data.problem_frequency}
						max={10}
						leftLabel="Rare"
						rightLabel="Frequent"
					/>
				</div>
			{/if}
			{#if data.problem_size != null}
				<div class="problem-analysis-meta-item problem-analysis-meta-item-full">
					<span class="problem-analysis-meta-label">Problem size</span>
					<ScoreSpectrumBar
						value={data.problem_size}
						max={10}
						leftLabel="Small"
						rightLabel="Large"
					/>
				</div>
			{/if}
			{#if data.vitamin_or_painkiller != null}
				<div class="problem-analysis-meta-item problem-analysis-meta-item-full">
					<span class="problem-analysis-meta-label">Vitamin vs painkiller</span>
					<ScoreSpectrumBar
						value={data.vitamin_or_painkiller}
						max={10}
						leftLabel="Vitamin"
						rightLabel="Painkiller"
					/>
				</div>
			{/if}
		</section>
	{/if}

	{#if data.alternative_solutions}
		<section class="problem-analysis-block">
			<h3 class="problem-analysis-section-title">Alternative solutions</h3>
			<p class="problem-analysis-prose">{data.alternative_solutions}</p>
		</section>
	{/if}

	{#if data.related_problems}
		<section class="problem-analysis-block">
			<h3 class="problem-analysis-section-title">Related problems</h3>
			<p class="problem-analysis-prose">{data.related_problems}</p>
		</section>
	{/if}

	<div class="problem-analysis-swot">
		<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
		<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
	</div>
</div>

<style>
	.problem-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.problem-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.problem-analysis-block {
		display: block;
	}

	.problem-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}

	.problem-analysis-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.problem-analysis-meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.problem-analysis-meta-item-full {
		flex: 1 1 100%;
	}

	.problem-analysis-meta-label {
		font-family: var(--font-sans);
		font-size: 0.6875rem;
		font-weight: 600;
		color: #fff;
	}

	.problem-analysis-swot {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
	}

	@media (max-width: 640px) {
		.problem-analysis-swot {
			grid-template-columns: 1fr;
		}
	}
</style>
