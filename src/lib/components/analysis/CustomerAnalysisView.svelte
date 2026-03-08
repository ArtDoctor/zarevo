<script lang="ts">
	import AnalysisSection from './AnalysisSection.svelte';
	import AnalysisBlock from './AnalysisBlock.svelte';
	import AnalysisCard from './AnalysisCard.svelte';
	import AnalysisSwotGrid from './AnalysisSwotGrid.svelte';
	import type { CustomerAnalysis } from '$lib/types/customer-analysis';

	interface Props {
		data: CustomerAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.customer_habits}
		<AnalysisBlock title="Customer habits" content={data.customer_habits} />
	{/if}

	{#if data.ideal_customers && data.ideal_customers.length > 0}
		<AnalysisBlock title="Ideal customers">
			<div class="flex flex-col gap-4">
				{#each data.ideal_customers as customer, i (customer.name ?? String(i))}
					<AnalysisCard>
						<div class="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
							<span class="text-base font-semibold text-white">{customer.name ?? 'Ideal customer'}</span>
							{#if customer.age != null || customer.gender}
								<span class="text-[0.8125rem] text-neutral-400">
									{#if customer.age != null}{customer.age}{/if}
									{#if customer.age != null && customer.gender} · {/if}
									{#if customer.gender}{customer.gender}{/if}
								</span>
							{/if}
							{#if customer.ready_to_pay_usd != null}
								<span class="text-[0.8125rem] font-semibold text-green-500 ml-auto">${customer.ready_to_pay_usd}/mo</span>
							{/if}
						</div>
						{#if customer.description}
							<p class="text-[0.9375rem] font-normal leading-[1.55] text-neutral-300 m-0">{customer.description}</p>
						{/if}
					</AnalysisCard>
				{/each}
			</div>
		</AnalysisBlock>
	{/if}

	{#if data.viable_segments && data.viable_segments.length > 0}
		<AnalysisBlock title="Viable segments">
			<div class="flex flex-col gap-4">
				{#each data.viable_segments as segment, i (segment.segment_name ?? String(i))}
					<AnalysisCard>
						<h4 class="text-base font-semibold text-white m-0 mb-2">{segment.segment_name ?? 'Segment'}</h4>
						{#if segment.description}
							<p class="text-[0.9375rem] font-normal leading-[1.55] text-neutral-300 m-0 mb-2">
								{segment.description}
							</p>
						{/if}
						{#if segment.preferred_payment_type}
							<p class="text-[0.8125rem] text-neutral-400 mt-1 mb-0">
								<span class="font-semibold text-white mr-1">Payment</span>
								{segment.preferred_payment_type}
							</p>
						{/if}
						{#if segment.willingness_and_ability_to_pay}
							<p class="text-[0.8125rem] text-neutral-400 mt-1 mb-0">
								<span class="font-semibold text-white mr-1">Willingness to pay</span>
								{segment.willingness_and_ability_to_pay}
							</p>
						{/if}
					</AnalysisCard>
				{/each}
			</div>
		</AnalysisBlock>
	{/if}

	{#if data.key_pain_points && data.key_pain_points.length > 0}
		<AnalysisSection title="Key pain points" items={data.key_pain_points} variant="negative" />
	{/if}

	{#if data.messages_that_resonate && data.messages_that_resonate.length > 0}
		<AnalysisSection title="Messages that resonate" items={data.messages_that_resonate} variant="positive" />
	{/if}

	<AnalysisSwotGrid>
		<AnalysisSection title="Strengths" items={data.strengths ?? []} variant="positive" />
		<AnalysisSection title="Weaknesses" items={data.weaknesses ?? []} variant="negative" />
	</AnalysisSwotGrid>
</div>
