<script lang="ts">
	import type { MarketData } from '$lib/types/market-analysis';

	interface Props {
		market: MarketData;
		years?: number[];
	}

	let { market, years = [2023, 2024, 2025, 2026] }: Props = $props();

	function formatSize(n: number): string {
		const b = n / 1000;
		return b >= 1 ? `$${b.toFixed(b % 1 === 0 ? 0 : 1)}B` : `$${n}M`;
	}

	const pts = $derived(market.sizes_2023_2026_in_millions ?? []);
	const maxVal = $derived(Math.max(...pts, 1));

	const tickValues = $derived.by(() => {
		const count = 4;
		const vals: number[] = [];
		for (let i = 0; i <= count; i++) {
			vals.push((maxVal * i) / count);
		}
		return vals;
	});

	const padding = { top: 8, right: 8, bottom: 24, left: 56 };
	const width = 300;
	const height = 160;
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;

	function x(i: number): number {
		return padding.left + (i / Math.max(1, years.length - 1)) * chartWidth;
	}

	function y(val: number): number {
		return padding.top + chartHeight - (val / maxVal) * chartHeight;
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<span class="text-sm font-semibold text-white">{market.name}</span>
		{#if market.growth_rate}
			<span class="text-xs font-normal text-neutral-400">{market.growth_rate}</span>
		{/if}
	</div>
	<svg
		viewBox="0 0 {width} {height}"
		class="w-full max-w-[340px] h-auto min-h-[140px]"
		preserveAspectRatio="xMidYMid meet"
	>
		{#each tickValues as val}
			{@const yPos = y(val)}
			<line
				x1={padding.left}
				y1={yPos}
				x2={width - padding.right}
				y2={yPos}
				stroke="#2a2a2a"
				stroke-width="1"
				stroke-dasharray="2 2"
			/>
			<text
				x={padding.left - 6}
				y={yPos}
				text-anchor="end"
				dominant-baseline="middle"
				class="text-[10px] font-medium fill-white"
			>
				{formatSize(val)}
			</text>
		{/each}

		{#each years as year, i}
			<text
				x={x(i)}
				y={height - 6}
				text-anchor="middle"
				class="text-[10px] font-medium fill-white"
			>
				{year}
			</text>
		{/each}

		{#if pts.length > 0}
			<polyline
				points={pts.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
				fill="none"
				stroke="#e04e2b"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			{#each pts as val, i}
				<circle cx={x(i)} cy={y(val)} r="3" fill="#e04e2b" />
			{/each}
		{/if}
	</svg>
</div>
