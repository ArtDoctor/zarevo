<script lang="ts">
	interface Props {
		label: string;
		value?: string;
		children?: import('svelte').Snippet;
		full?: boolean;
	}

	let { label, value, children, full = false }: Props = $props();
</script>

<div class="flex flex-col gap-1 {full ? 'flex-[1_1_100%]' : ''}">
	<span class="text-[0.6875rem] font-semibold text-white">{label}</span>
	{#if children}
		{@render children?.()}
	{:else if value != null}
		<span class="text-[0.8125rem] font-normal text-white">{value}</span>
	{/if}
</div>
