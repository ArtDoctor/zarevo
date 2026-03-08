<script lang="ts">
	interface Props {
		class?: string;
		width?: string;
		height?: string;
	}

	let { class: className = '', width, height }: Props = $props();
</script>

<div
	class="skeleton rounded-lg {className}"
	style:width={width}
	style:height={height}
	aria-hidden="true"
></div>

<style>
	.skeleton {
		background: linear-gradient(
			90deg,
			#1c1c1c 0%,
			#282828 25%,
			#1c1c1c 50%,
			#282828 75%,
			#1c1c1c 100%
		);
		background-size: 200% 100%;
		animation: skeleton-flow 1.5s ease-in-out infinite;
	}

	@keyframes skeleton-flow {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
