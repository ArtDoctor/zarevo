<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		onSubmit: (startupIdea: string) => void;
		onSubmitPro: (startupIdea: string) => void;
		advancedPath?: string;
		credits?: number;
		isAuthenticated?: boolean;
		disabled?: boolean;
	}

	let {
		onSubmit,
		onSubmitPro,
		advancedPath = '/home/advanced',
		credits = 0,
		isAuthenticated = false,
		disabled = false
	}: Props = $props();

	let startupIdea = $state('');

	const canBasic = $derived(!isAuthenticated || credits >= 1);
	const canPro = $derived(!isAuthenticated || credits >= 4);
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
			disabled={disabled || !canBasic}
			title={!canBasic ? 'Requires at least 1 credit' : ''}
			class="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Validate - basic
		</button>
		<button
			type="button"
			onclick={() => onSubmitPro(startupIdea)}
			disabled={disabled || !canPro}
			title={!canPro ? 'Requires at least 4 credits' : ''}
			class="px-8 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Validate - pro
		</button>
		<button
			type="button"
			onclick={() => goto(advancedPath)}
			disabled={disabled}
			class="px-8 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Advanced
		</button>
	</div>
</form>
