<script lang="ts">
	import AdvancedValidation from '$lib/components/AdvancedValidation.svelte';
</script>

<svelte:head>
	<title>Advanced Validation - Zarevo</title>
</svelte:head>

<AdvancedValidation backHref="/idea-new" backLabel="Back to new idea" redirectIfAuthenticated={false} />
