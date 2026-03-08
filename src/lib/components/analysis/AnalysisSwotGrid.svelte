<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-6 gap-x-8 sm:grid-cols-2">
	{@render children?.()}
</div>
