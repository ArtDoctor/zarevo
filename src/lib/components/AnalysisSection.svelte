<script lang="ts">
	interface Props {
		title: string;
		items: string[];
		variant?: 'default' | 'positive' | 'negative' | 'neutral';
	}

	let { title, items, variant = 'default' }: Props = $props();

	const variantClass = $derived({
		default: 'analysis-section-default',
		positive: 'analysis-section-positive',
		negative: 'analysis-section-negative',
		neutral: 'analysis-section-neutral'
	}[variant]);
</script>

{#if items && items.length > 0}
	<section class="analysis-section {variantClass}">
		<h3 class="analysis-section-title">{title}</h3>
		<ul class="analysis-section-list">
			{#each items as item}
				<li class="analysis-section-item">{item}</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.analysis-section {
		margin-bottom: 1.5rem;
	}

	.analysis-section-title {
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 600;
		color: #fff;
		margin-bottom: 0.5rem;
	}

	.analysis-section-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.analysis-section-item {
		font-family: var(--font-sans);
		position: relative;
		padding-left: 1rem;
		margin-bottom: 0.5rem;
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.5;
		color: #fff;
	}

	.analysis-section-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.5em;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #737373;
	}

	.analysis-section-positive .analysis-section-item::before {
		background: #22c55e;
	}

	.analysis-section-negative .analysis-section-item::before {
		background: #ef4444;
	}

	.analysis-section-neutral .analysis-section-item::before {
		background: #a3a3a3;
	}
</style>
