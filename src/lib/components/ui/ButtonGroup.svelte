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
	const canPro = $derived(!isAuthenticated || credits >= 4);
</script>

<div class="flex flex-col sm:flex-row gap-2 {className}">
	<Button
		type="submit"
		variant="primary"
		color="grey"
		size="lg"
		disabled={disabled || !canBasic}
		title={!canBasic ? 'Requires at least 1 credit' : ''}
		class="flex-1"
	>
		Basic validation
	</Button>
	<Button
		type="button"
		variant="primary"
		color="orange"
		size="lg"
		onclick={onPro}
		disabled={disabled || !canPro}
		title={!canPro ? 'Requires at least 4 credits' : ''}
		class="flex-1"
	>
		Advanced validation
	</Button>
</div>
