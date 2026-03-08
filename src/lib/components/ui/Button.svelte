<script lang="ts">
	/**
	 * Reusable Button Component
	 * 
	 * Usage:
	 * <Button variant="primary" color="orange" size="md">Click me</Button>
	 * <Button variant="icon" color="grey" size="sm"><Icon /></Button>
	 * <Button href="/about" variant="normal">Link Button</Button>
	 */

	type Variant = 'primary' | 'normal' | 'icon';
	type Color = 'orange' | 'white' | 'grey';
	type Size = 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	interface Props {
		variant?: Variant;
		color?: Color;
		size?: Size;
		disabled?: boolean;
		href?: string;
		type?: ButtonType;
		class?: string;
		title?: string;
		onclick?: (event: MouseEvent) => void;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		variant = 'normal',
		color = 'orange',
		size = 'md',
		disabled = false,
		href = undefined,
		type = 'button',
		class: className = '',
		children,
		...restProps
	}: Props = $props();

	// Base styles applied to all buttons
	const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed';

	// Variant styles
	const variantStyles: Record<Variant, Record<Color, string>> = {
		primary: {
			orange: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
			white: 'bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
			grey: 'bg-neutral-700 text-white hover:bg-neutral-600 active:bg-neutral-500'
		},
		normal: {
			orange: 'bg-neutral-800 border border-primary/30 text-primary hover:bg-neutral-700 hover:border-primary/50 active:bg-neutral-600',
			white: 'bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 hover:border-neutral-600 active:bg-neutral-600',
			grey: 'bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600 active:bg-neutral-600'
		},
		icon: {
			orange: 'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20',
			white: 'bg-transparent text-white hover:bg-white/10 active:bg-white/20',
			grey: 'bg-transparent text-neutral-400 hover:bg-neutral-800 active:bg-neutral-700'
		}
	};

	// Size styles
	const sizeStyles: Record<Variant, Record<Size, string>> = {
		primary: {
			sm: 'text-sm px-3 py-1.5',
			md: 'text-sm px-4 py-2',
			lg: 'text-base px-6 py-3'
		},
		normal: {
			sm: 'text-sm px-3 py-1.5',
			md: 'text-sm px-4 py-2',
			lg: 'text-base px-6 py-3'
		},
		icon: {
			sm: 'text-sm p-1.5',
			md: 'text-sm p-2',
			lg: 'text-base p-3'
		}
	};

	// Compute final classes
	const computedClasses = $derived(
		`${baseStyles} ${variantStyles[variant][color]} ${sizeStyles[variant][size]} ${className}`
	);
</script>

{#if href}
	<a
		{href}
		class={computedClasses}
		aria-disabled={disabled}
		tabindex={disabled ? -1 : 0}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={computedClasses}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
