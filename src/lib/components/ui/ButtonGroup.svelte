<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		onBasic: () => void;
		onPro: () => void;
		disabled?: boolean;
		credits?: number;
		isAuthenticated?: boolean;
		class?: string;
	}

	let {
		onBasic,
		onPro,
		disabled = false,
		credits = 0,
		isAuthenticated = false,
		class: className = ''
	}: Props = $props();

	const canBasic = $derived(!isAuthenticated || credits >= 1);
	const canPro = $derived(!isAuthenticated || credits >= 5);
</script>

<div class="flex flex-col sm:flex-row gap-2 {className}">
	<div class="flex-1 flex flex-col gap-1">
		<Button
			type="submit"
			variant="primary"
			color="grey"
			cost={1}
			size="lg"
			disabled={disabled || !canBasic}
			title={!canBasic ? 'Requires at least 1 credit' : ''}
			class="w-full"
		>
			Basic validation
		</Button>
		<a href="/home#features" class="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-300 transition-colors px-1 mt-1">
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<path d="M12 16v-4"/>
				<path d="M12 8h.01"/>
			</svg>
			More about Basic validation
		</a>
	</div>
	<div class="flex-1 flex flex-col gap-1">
		<Button
			type="button"
			variant="primary"
			color="orange"
			cost={4}
			size="lg"
			onclick={onPro}
			disabled={disabled || !canPro}
			title={!canPro ? 'Requires at least 5 credits' : ''}
			class="w-full"
		>
			Advanced validation
		</Button>
		<a href="/home#features" class="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-300 transition-colors px-1 mt-1">
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<path d="M12 16v-4"/>
				<path d="M12 8h.01"/>
			</svg>
			More about Advanced validation
		</a>
	</div>
</div>
