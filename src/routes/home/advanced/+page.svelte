<script lang="ts">
	import AdvancedValidation from '$lib/components/AdvancedValidation.svelte';
</script>

<svelte:head>
	<script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.67/build/spline-viewer.js"></script>
</svelte:head>

<section class="min-h-[90vh] w-screen bg-linear-to-b from-neutral-900 to-neutral-950 -mx-3 relative left-1/2 right-1/2 -translate-x-1/2 overflow-hidden">
	<div class="relative z-10">
		<AdvancedValidation backHref="/home" backLabel="Back to home" />
	</div>
	
	<!-- Spline Animation -->
	<div class="absolute bottom-0 left-0 w-full h-[400px] z-0">
		<spline-viewer url="https://prod.spline.design/FVYpaJUhLfAnywyj/scene.splinecode" class="w-full h-full"></spline-viewer>
	</div>
</section>
