<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		onSubmit: (startupIdea: string) => void;
		showAdvanced?: boolean;
		advancedPath?: string;
		disabled?: boolean;
	}

	let { onSubmit, showAdvanced = true, advancedPath = '/home/advanced', disabled = false }: Props = $props();

	let startupIdea = $state('');
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		onSubmit(startupIdea);
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
			disabled={disabled}
			class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Validate
		</button>
		{#if showAdvanced}
			<button
				type="button"
				onclick={() => goto(advancedPath)}
				class="px-8 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
			>
				Advanced
			</button>
		{/if}
	</div>
</form>
