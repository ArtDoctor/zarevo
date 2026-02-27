<script lang="ts">
	import { onMount } from 'svelte';
	import { checkAuth } from '$lib/pocketbase';
	import { validationFormStore } from '$lib/stores/validation-form';

	onMount(() => {
		checkAuth();
	});
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	<h1 class="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-8">Dashboard</h1>

	{#if $validationFormStore.startupIdea || $validationFormStore.targetMarket || $validationFormStore.problem || $validationFormStore.solution || $validationFormStore.competitors}
		<div class="space-y-6 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 bg-white dark:bg-zinc-900/50">
			<h2 class="text-lg font-medium text-zinc-800 dark:text-zinc-200">Your validation input</h2>

			{#if $validationFormStore.startupIdea}
				<div>
					<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Startup idea</dt>
					<dd class="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{$validationFormStore.startupIdea}</dd>
				</div>
			{/if}

			{#if $validationFormStore.targetMarket}
				<div>
					<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Target market</dt>
					<dd class="mt-1 text-zinc-800 dark:text-zinc-200">{$validationFormStore.targetMarket}</dd>
				</div>
			{/if}

			{#if $validationFormStore.problem}
				<div>
					<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Problem</dt>
					<dd class="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{$validationFormStore.problem}</dd>
				</div>
			{/if}

			{#if $validationFormStore.solution}
				<div>
					<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Solution</dt>
					<dd class="mt-1 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{$validationFormStore.solution}</dd>
				</div>
			{/if}

			{#if $validationFormStore.competitors}
				<div>
					<dt class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Competitors</dt>
					<dd class="mt-1 text-zinc-800 dark:text-zinc-200">{$validationFormStore.competitors}</dd>
				</div>
			{/if}
		</div>
	{:else}
		<p class="text-zinc-600 dark:text-zinc-400">Fill out and validate a startup idea on the home page to see it here.</p>
	{/if}
</div>
