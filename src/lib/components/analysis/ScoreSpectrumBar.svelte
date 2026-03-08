<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		leftLabel?: string;
		rightLabel?: string;
	}

	let { value, max = 100, leftLabel = 'Vitamin', rightLabel = 'Painkiller' }: Props = $props();

	const pct = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div class="flex items-center gap-3">
	<span class="text-[0.8125rem] font-semibold whitespace-nowrap text-white">{leftLabel}</span>
	<div class="flex flex-1 min-w-0 h-2.5 rounded-full bg-neutral-600 overflow-hidden">
		<div
			class="h-full rounded-full bg-primary flex-shrink-0 transition-[width] duration-300 ease-out"
			style="width: {pct}%"
		></div>
		{#if pct < 99.9}
			<div class="flex-1 min-w-0 h-full bg-transparent"></div>
		{/if}
	</div>
	<span class="text-[0.8125rem] font-semibold whitespace-nowrap text-white">{rightLabel}</span>
</div>
