<script lang="ts">
	import type { CompetitorAnalysis } from '$lib/types/competitor-analysis';

	interface Props {
		data: CompetitorAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="competitor-analysis">
	{#if data.overview}
		<section class="competitor-analysis-block">
			<h3 class="competitor-analysis-section-title">Overview</h3>
			<p class="competitor-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.competitors && data.competitors.length > 0}
		<!-- The texts turned out to be very big. I know we planned this to be a table, but it wouldn't fit in a table I think. We could discuss this later. -->
		<section class="competitor-analysis-block">
			<h3 class="competitor-analysis-section-title">Competitors</h3>
			<div class="competitor-analysis-list">
				{#each data.competitors as competitor, i (competitor.name ?? String(i))}
					<div class="competitor-analysis-card">
						<div class="competitor-analysis-card-header">
							<h4 class="competitor-analysis-card-name">{competitor.name ?? 'Competitor'}</h4>
							{#if competitor.revenue}
								<span class="competitor-analysis-card-revenue">{competitor.revenue}</span>
							{/if}
						</div>
						{#if competitor.description}
							<p class="competitor-analysis-card-desc">{competitor.description}</p>
						{/if}
						{#if competitor.features}
							<p class="competitor-analysis-card-meta">
								<span class="competitor-analysis-card-label">Features</span>
								{competitor.features}
							</p>
						{/if}
						{#if competitor.online_presence}
							<p class="competitor-analysis-card-meta">
								<span class="competitor-analysis-card-label">Online presence</span>
								{competitor.online_presence}
							</p>
						{/if}
						<div class="competitor-analysis-card-swot">
							{#if competitor.strengths}
								<div class="competitor-analysis-card-swot-item competitor-analysis-card-strengths">
									<span class="competitor-analysis-card-label">Strengths</span>
									<p>{competitor.strengths}</p>
								</div>
							{/if}
							{#if competitor.weaknesses}
								<div class="competitor-analysis-card-swot-item competitor-analysis-card-weaknesses">
									<span class="competitor-analysis-card-label">Weaknesses</span>
									<p>{competitor.weaknesses}</p>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.competitor-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.competitor-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.competitor-analysis-block {
		display: block;
	}

	.competitor-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}

	.competitor-analysis-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.competitor-analysis-card {
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.competitor-analysis-card-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1rem;
		margin-bottom: 0.5rem;
	}

	.competitor-analysis-card-name {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
		margin: 0;
	}

	.competitor-analysis-card-revenue {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #a3a3a3;
	}

	.competitor-analysis-card-desc {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 400;
		line-height: 1.55;
		color: #d4d4d4;
		margin: 0 0 0.5rem 0;
	}

	.competitor-analysis-card-meta {
		font-size: 0.9375rem;
		line-height: 1.55;
		color: #d4d4d4;
		margin: 0.25rem 0 0 0;
	}

	.competitor-analysis-card-label {
		font-weight: 600;
		color: #fff;
		margin-right: 0.25rem;
	}

	.competitor-analysis-card-swot {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem 1.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #2a2a2a;
	}

	@media (max-width: 640px) {
		.competitor-analysis-card-swot {
			grid-template-columns: 1fr;
		}
	}

	.competitor-analysis-card-swot-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.competitor-analysis-card-swot-item p {
		font-size: 0.9375rem;
		line-height: 1.55;
		color: #d4d4d4;
		margin: 0;
	}

	.competitor-analysis-card-strengths .competitor-analysis-card-label {
		color: #22c55e;
	}

	.competitor-analysis-card-weaknesses .competitor-analysis-card-label {
		color: #ef4444;
	}
</style>
