<script lang="ts">
	import AnalysisBlock from './AnalysisBlock.svelte';
	import type { LegalAnalysis } from '$lib/types/legal-analysis';

	interface Props {
		data: LegalAnalysis;
	}

	let { data }: Props = $props();
</script>

<div class="flex flex-col gap-6">
	{#if data.overview}
		<AnalysisBlock title="Overview" content={data.overview} />
	{/if}

	{#if data.GDPR_compliance}
		<AnalysisBlock title="GDPR compliance" content={data.GDPR_compliance} />
	{/if}

	{#if data.EU_AI_compliance}
		<AnalysisBlock title="EU AI compliance" content={data.EU_AI_compliance} />
	{/if}
</div>
