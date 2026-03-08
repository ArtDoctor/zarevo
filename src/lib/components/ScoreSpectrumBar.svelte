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

<div class="score-spectrum">
	<span class="score-spectrum-label">{leftLabel}</span>
	<div class="score-spectrum-track">
		<div
			class="score-spectrum-fill"
			style="width: {pct}%"
		></div>
		{#if pct < 99.9}
			<div class="score-spectrum-unfilled"></div>
		{/if}
	</div>
	<span class="score-spectrum-label">{rightLabel}</span>
</div>

<style>
	.score-spectrum {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.score-spectrum-label {
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 600;
		white-space: nowrap;
		color: #fff;
	}

	.score-spectrum-track {
		flex: 1;
		min-width: 0;
		height: 10px;
		border-radius: 9999px;
		background: #4a4a4a;
		overflow: hidden;
		display: flex;
	}

	.score-spectrum-fill {
		height: 100%;
		background: #e04e2b;
		border-radius: 9999px;
		flex-shrink: 0;
		transition: width 0.3s ease;
	}

	.score-spectrum-unfilled {
		flex: 1;
		min-width: 0;
		height: 100%;
		background: transparent;
	}
</style>
