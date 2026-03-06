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
		class="w-full h-32 md:h-40 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none text-lg"
		rows="5"
		style="--tw-ring-color: var(--color-primary);"
	></textarea>

	<div class="flex flex-col sm:flex-row gap-3 justify-center">
		<button
			type="submit"
			disabled={disabled || !canBasic}
			title={!canBasic ? 'Requires at least 1 credit' : ''}
			class="btn btn-lg btn-primary"
		>
			Validate - basic
		</button>
		<button
			type="button"
			onclick={() => onSubmitPro(startupIdea)}
			disabled={disabled || !canPro}
			title={!canPro ? 'Requires at least 4 credits' : ''}
			class="btn btn-lg btn-secondary"
		>
			Validate - pro
		</button>
		<button
			type="button"
			onclick={() => goto(advancedPath)}
			disabled={disabled}
			class="btn btn-lg btn-secondary"
		>
			Advanced
		</button>
	</div>
</form>
