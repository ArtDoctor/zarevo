<script lang="ts">
	interface Props {
		title: string;
		items: string[];
		variant?: 'default' | 'positive' | 'negative' | 'neutral';
	}

	let { title, items, variant = 'default' }: Props = $props();

	const dotColor = $derived(
		{ default: '#737373', positive: '#22c55e', negative: '#ef4444', neutral: '#a3a3a3' }[variant]
	);
</script>

{#if items && items.length > 0}
	<section class="mb-6">
		<h3 class="text-xl font-semibold text-white mb-2">{title}</h3>
		<ul class="list-none p-0 m-0">
			{#each items as item}
				<li
					class="relative pl-4 mb-2 text-base font-normal leading-normal text-white before:content-[''] before:absolute before:left-0 before:top-[0.5em] before:w-1 before:h-1 before:rounded-full before:bg-[var(--bullet-color)]"
					style="--bullet-color: {dotColor}"
				>
					{item}
				</li>
			{/each}
		</ul>
	</section>
{/if}
