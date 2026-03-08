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

<div class="market-graph">
	<div class="market-graph-header">
		<span class="market-graph-name">{market.name}</span>
		{#if market.growth_rate}
			<span class="market-graph-growth">{market.growth_rate}</span>
		{/if}
	</div>
	<svg
		viewBox="0 0 {width} {height}"
		class="market-graph-svg"
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
				class="market-graph-axis-label"
			>
				{formatSize(val)}
			</text>
		{/each}

		{#each years as year, i}
			<text
				x={x(i)}
				y={height - 6}
				text-anchor="middle"
				class="market-graph-axis-label"
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

<style>
	.market-graph {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.market-graph-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.market-graph-name {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 600;
		color: #fff;
	}

	.market-graph-growth {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 400;
		color: #a3a3a3;
	}

	.market-graph-svg {
		width: 100%;
		max-width: 340px;
		height: auto;
		min-height: 140px;
	}

	.market-graph-axis-label {
		font-family: var(--font-sans);
		font-size: 10px;
		fill: #fff;
		font-weight: 500;
	}
</style>
