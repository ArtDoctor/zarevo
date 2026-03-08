<script lang="ts">
	import AnalysisSection from './AnalysisSection.svelte';
	import type { CustomerAnalysis } from '$lib/types/customer-analysis';

	interface Props {
		data: CustomerAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="customer-analysis">
	{#if data.overview}
		<section class="customer-analysis-block">
			<h3 class="customer-analysis-section-title">Overview</h3>
			<p class="customer-analysis-prose">{data.overview}</p>
		</section>
	{/if}

	{#if data.customer_habits}
		<section class="customer-analysis-block">
			<h3 class="customer-analysis-section-title">Customer habits</h3>
			<p class="customer-analysis-prose">{data.customer_habits}</p>
		</section>
	{/if}

	{#if data.ideal_customers && data.ideal_customers.length > 0}
		<section class="customer-analysis-block">
			<h3 class="customer-analysis-section-title">Ideal customers</h3>
			<div class="customer-analysis-cards">
				{#each data.ideal_customers as customer, i (customer.name ?? String(i))}
					<div class="customer-analysis-card">
						<div class="customer-analysis-card-header">
							<span class="customer-analysis-card-name">{customer.name ?? 'Ideal customer'}</span>
							{#if customer.age != null || customer.gender}
								<span class="customer-analysis-card-meta">
									{#if customer.age != null}{customer.age}{/if}
									{#if customer.age != null && customer.gender} · {/if}
									{#if customer.gender}{customer.gender}{/if}
								</span>
							{/if}
							{#if customer.ready_to_pay_usd != null}
								<span class="customer-analysis-card-price">${customer.ready_to_pay_usd}/mo</span>
							{/if}
						</div>
						{#if customer.description}
							<p class="customer-analysis-card-desc">{customer.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.viable_segments && data.viable_segments.length > 0}
		<section class="customer-analysis-block">
			<h3 class="customer-analysis-section-title">Viable segments</h3>
			<div class="customer-analysis-segments">
				{#each data.viable_segments as segment, i (segment.segment_name ?? String(i))}
					<div class="customer-analysis-segment">
						<h4 class="customer-analysis-segment-name">{segment.segment_name ?? 'Segment'}</h4>
						{#if segment.description}
							<p class="customer-analysis-segment-desc">{segment.description}</p>
						{/if}
						{#if segment.preferred_payment_type}
							<p class="customer-analysis-segment-meta">
								<span class="customer-analysis-segment-label">Payment</span>
								{segment.preferred_payment_type}
							</p>
						{/if}
						{#if segment.willingness_and_ability_to_pay}
							<p class="customer-analysis-segment-meta">
								<span class="customer-analysis-segment-label">Willingness to pay</span>
								{segment.willingness_and_ability_to_pay}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.key_pain_points && data.key_pain_points.length > 0}
		<AnalysisSection title="Key pain points" items={data.key_pain_points} variant="negative" />
	{/if}

	{#if data.messages_that_resonate && data.messages_that_resonate.length > 0}
		<AnalysisSection title="Messages that resonate" items={data.messages_that_resonate} variant="positive" />
	{/if}

	<div class="customer-analysis-swot">
		<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
		<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
	</div>
</div>

<style>
	.customer-analysis {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.customer-analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.customer-analysis-block {
		display: block;
	}

	.customer-analysis-prose {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.65;
		color: #fff;
		white-space: pre-wrap;
	}

	.customer-analysis-cards {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.customer-analysis-card {
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.customer-analysis-card-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin-bottom: 0.5rem;
	}

	.customer-analysis-card-name {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
	}

	.customer-analysis-card-meta {
		font-size: 0.8125rem;
		color: #a3a3a3;
	}

	.customer-analysis-card-price {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #22c55e;
		margin-left: auto;
	}

	.customer-analysis-card-desc {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 400;
		line-height: 1.55;
		color: #d4d4d4;
		margin: 0;
	}

	.customer-analysis-segments {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.customer-analysis-segment {
		padding: 1rem 1.25rem;
		background: #1d1d1d;
		border-radius: 8px;
		border: 1px solid #2a2a2a;
	}

	.customer-analysis-segment-name {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
		margin: 0 0 0.5rem 0;
	}

	.customer-analysis-segment-desc {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 400;
		line-height: 1.55;
		color: #d4d4d4;
		margin: 0 0 0.5rem 0;
	}

	.customer-analysis-segment-meta {
		font-size: 0.8125rem;
		color: #a3a3a3;
		margin: 0.25rem 0 0 0;
	}

	.customer-analysis-segment-label {
		font-weight: 600;
		color: #fff;
		margin-right: 0.25rem;
	}

	.customer-analysis-swot {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
	}

	@media (max-width: 640px) {
		.customer-analysis-swot {
			grid-template-columns: 1fr;
		}
	}
</style>
