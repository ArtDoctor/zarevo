<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<section class="flex flex-wrap gap-x-8 gap-y-4 p-4 px-5 bg-[#1d1d1d] rounded-lg border border-[#2a2a2a]">
	{@render children?.()}
</section>
