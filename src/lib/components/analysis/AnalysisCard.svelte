<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="p-4 px-5 bg-[#1d1d1d] rounded-lg border border-[#2a2a2a]">
	{@render children?.()}
</div>
