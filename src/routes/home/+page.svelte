<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';

	let startupIdea = $state('');

	onMount(() => {
		if (pb.authStore.isValid) {
			goto('/', { replaceState: true });
		}
	});

	function handleSubmit() {
		if (startupIdea.trim()) {
			goto('/home/advanced');
		}
	}
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center px-4">
	<h2 class="text-2xl md:text-3xl font-semibold text-center text-zinc-800 dark:text-zinc-200 mb-8">
		Imagine a startup. Now validate it.
	</h2>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="w-full max-w-2xl space-y-4"
	>
		<textarea
			bind:value={startupIdea}
			placeholder="Describe your startup idea..."
			class="w-full h-32 md:h-40 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-lg"
			rows="5"
		></textarea>

		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<button
				type="submit"
				class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
			>
				Validate
			</button>
			<a
				href="/home/advanced"
				class="px-8 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors text-center"
			>
				Advanced
			</a>
		</div>
	</form>
</div>
