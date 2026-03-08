<script lang="ts">
	import type { LegalAnalysis } from '$lib/types/legal-analysis';

	interface Props {
		data: LegalAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="legal-analysis">
	{#if data.overview}
		<section class="legal-analysis-block">
			<h3 class="legal-analysis-section-title">Overview</h3>
			<p class="legal-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.GDPR_compliance}
		<section class="legal-analysis-block">
			<h3 class="legal-analysis-section-title">GDPR compliance</h3>
			<p class="legal-analysis-prose">{data.GDPR_compliance}</p>
		</section>
	{/if}

	{#if data.EU_AI_compliance}
		<section class="legal-analysis-block">
			<h3 class="legal-analysis-section-title">EU AI compliance</h3>
			<p class="legal-analysis-prose">{data.EU_AI_compliance}</p>
		</section>
	{/if}
</div>

<style>
	.legal-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.legal-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.legal-analysis-block {
		display: block;
	}

	.legal-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}
</style>
