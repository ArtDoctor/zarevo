<script lang="ts">
	import AnalysisBlock from './AnalysisBlock.svelte';
	import AnalysisCard from './AnalysisCard.svelte';
	import type { CompetitorAnalysis } from '$lib/types/competitor-analysis';

	interface Props {
		data: CompetitorAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.competitors && data.competitors.length > 0}
		<AnalysisBlock title="Competitors">
			<div class="flex flex-col gap-4">
				{#each data.competitors as competitor, i (competitor.name ?? String(i))}
					<AnalysisCard>
						<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-2">
							<h4 class="text-base font-semibold text-white m-0">{competitor.name ?? 'Competitor'}</h4>
							{#if competitor.revenue}
								<span class="text-[0.8125rem] font-semibold text-neutral-400">{competitor.revenue}</span>
							{/if}
						</div>
						{#if competitor.description}
							<p class="text-[0.9375rem] font-normal leading-[1.55] text-neutral-300 m-0 mb-2">
								{competitor.description}
							</p>
						{/if}
						{#if competitor.features}
							<p class="text-[0.9375rem] leading-[1.55] text-neutral-300 mt-1 mb-0">
								<span class="font-semibold text-white mr-1">Features</span>
								{competitor.features}
							</p>
						{/if}
						{#if competitor.online_presence}
							<p class="text-[0.9375rem] leading-[1.55] text-neutral-300 mt-1 mb-0">
								<span class="font-semibold text-white mr-1">Online presence</span>
								{competitor.online_presence}
							</p>
						{/if}
						{#if competitor.strengths || competitor.weaknesses}
							<div class="grid grid-cols-1 gap-4 gap-x-6 mt-4 pt-4 border-t border-[#2a2a2a] sm:grid-cols-2">
								{#if competitor.strengths}
									<div class="flex flex-col gap-1">
										<span class="font-semibold text-green-500">Strengths</span>
										<p class="text-[0.9375rem] leading-[1.55] text-neutral-300 m-0">{competitor.strengths}</p>
									</div>
								{/if}
								{#if competitor.weaknesses}
									<div class="flex flex-col gap-1">
										<span class="font-semibold text-red-500">Weaknesses</span>
										<p class="text-[0.9375rem] leading-[1.55] text-neutral-300 m-0">{competitor.weaknesses}</p>
									</div>
								{/if}
							</div>
						{/if}
					</AnalysisCard>
				{/each}
			</div>
		</AnalysisBlock>
	{/if}
</div>
