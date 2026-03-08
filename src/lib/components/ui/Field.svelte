<script lang="ts">
	type FieldType = 'input' | 'textarea';

	interface Props {
		type?: FieldType;
		placeholder?: string;
		maxChars?: number;
		value?: string;
		id?: string;
		rows?: number;
		class?: string;
		disabled?: boolean;
	}

	let {
		type = 'input',
		placeholder = '',
		maxChars = undefined,
		value = $bindable(''),
		id = undefined,
		rows = 4,
		class: className = '',
		disabled = false
	}: Props = $props();

	let isFocused = $state(false);

	const charCount = $derived(value.length);
	const showCounter = $derived(maxChars !== undefined);
</script>

<div class="relative {className}">
	{#if type === 'textarea'}
		<textarea
			{id}
			bind:value
			{placeholder}
			{rows}
			{disabled}
			maxlength={maxChars}
			onfocus={() => isFocused = true}
			onblur={() => isFocused = false}
			class="field-base field-textarea {isFocused ? 'field-focused' : ''}"
		></textarea>
	{:else}
		<input
			{id}
			type="text"
			bind:value
			{placeholder}
			{disabled}
			maxlength={maxChars}
			onfocus={() => isFocused = true}
			onblur={() => isFocused = false}
			class="field-base field-input {isFocused ? 'field-focused' : ''}"
		/>
	{/if}

	{#if showCounter}
		<div class="absolute bottom-4 right-4 text-xs text-zinc-500 pointer-events-none">
			{charCount}/{maxChars}
		</div>
	{/if}
</div>

<style>
	.field-base {
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		background-color: rgba(10, 10, 10, 0.5);
		backdrop-filter: blur(30px);
		-webkit-backdrop-filter: blur(30px);
		border: 1px solid rgba(64, 64, 64, 0.3);
		color: white;
		font-size: 1rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
		background-image: linear-gradient(
			135deg,
			rgba(30, 30, 30, 0.4) 0%,
			rgba(20, 20, 20, 0.4) 25%,
			rgba(15, 15, 15, 0.4) 50%,
			rgba(20, 20, 20, 0.4) 75%,
			rgba(30, 30, 30, 0.4) 100%
		);
		background-size: 200% 200%;
		animation: gradient-shift 8s ease infinite;
	}

	.field-base::placeholder {
		color: rgba(161, 161, 170, 0.5);
	}

	.field-base:focus {
		outline: none;
	}

	.field-focused {
		animation: none;
		border-color: var(--color-primary, #ff6b35);
		box-shadow: 0 0 0 1px var(--color-primary, #ff6b35);
		background-image: linear-gradient(
			135deg,
			rgba(10, 10, 10, 0.5) 0%,
			rgba(10, 10, 10, 0.5) 100%
		);
	}

	.field-base:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.field-textarea {
		resize: vertical;
		min-height: 6rem;
	}

	.field-input {
		height: 3rem;
	}

	@keyframes gradient-shift {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
