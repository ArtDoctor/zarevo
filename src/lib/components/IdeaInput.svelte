<script lang="ts">
	import { goto } from '$app/navigation';
	import Field from '$lib/components/ui/Field.svelte';
	import ButtonGroup from '$lib/components/ui/ButtonGroup.svelte';
	import { SlidersHorizontal } from 'lucide-svelte';

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
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		onSubmit(startupIdea);
	}}
	class="w-full max-w-2xl space-y-2 pb-48"
>
	<div>
		<div class="relative">
			<Field
				id="main"
				type="textarea"
				bind:value={startupIdea}
				placeholder="Describe your idea. Don't overthink it, no prompt magic, be casual."
				rows={4}
				maxChars={800}
			/>
			<div class="absolute bottom-4 left-2">
				<button
					type="button"
					onclick={() => goto(advancedPath)}
					class="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-all px-4 py-1.5 rounded-md bg-neutral-800/80 hover:bg-neutral-700/80"
				>
					<SlidersHorizontal size={14} strokeWidth={2.5} />
					More options
				</button>
			</div>
		</div>
	</div>

	<ButtonGroup
		onBasic={() => onSubmit(startupIdea)}
		onPro={() => onSubmitPro(startupIdea)}
		{disabled}
		{credits}
		{isAuthenticated}
	/>
</form>
