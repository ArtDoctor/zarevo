<script lang="ts">
	interface Props {
		title: string;
		content?: string;
		children?: import('svelte').Snippet;
	}

	let { title, content, children }: Props = $props();
</script>

<section>
	<h3 class="text-xl font-semibold text-white mb-2">{title}</h3>
	{#if children}
		{@render children?.()}
	{:else if content}
		<p class="text-base font-normal leading-[1.65] text-white whitespace-pre-wrap">{content}</p>
	{/if}
</section>
