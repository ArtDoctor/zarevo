<script lang="ts">
	import { onMount } from 'svelte';
	import { checkAuth } from '$lib/pocketbase';

	onMount(() => {
		checkAuth();
	});
</script>

<h1>Dashboard</h1>
