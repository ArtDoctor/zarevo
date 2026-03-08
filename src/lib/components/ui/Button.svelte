<script lang="ts">
	/**
	 * Reusable Button Component
	 * 
	 * Usage:
	 * <Button variant="primary" color="orange" size="md">Click me</Button>
	 * <Button variant="icon" color="grey" size="sm"><Icon /></Button>
	 * <Button href="/about" variant="normal">Link Button</Button>
	 */

	type Variant = 'primary' | 'normal' | 'icon' | 'link';
	type Color = 'orange' | 'white' | 'grey' | 'green';
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
		cost?: number;
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
		cost = undefined,
		children,
		...restProps
	}: Props = $props();

	// Base styles applied to all buttons
	const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed';

	// Variant styles
	const variantStyles: Record<Variant, Record<Color, string>> = {
		primary: {
			orange: 'bg-primary font-medium text-white hover:bg-[#FF4E17] active:bg-primary/80',
			white: 'bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
			grey: 'bg-neutral-700 text-white hover:bg-neutral-600 active:bg-neutral-500',
			green: 'bg-[#0CA12D] font-medium text-white hover:bg-[#07AF2C] active:bg-[#0CA12D]/80'
		},
		normal: {
			orange: 'bg-neutral-800 font-medium text-primary hover:bg-neutral-700 active:bg-neutral-600',
			white: 'bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-600',
			grey: 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:bg-neutral-600',
			green: 'bg-[#0CA12D] font-medium text-white hover:bg-[#07AF2C] active:bg-[#0CA12D]/80'
		},
		icon: {
			orange: 'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20',
			white: 'bg-transparent text-white hover:bg-white/10 active:bg-white/20',
			grey: 'bg-transparent text-neutral-400 hover:bg-neutral-800 active:bg-neutral-700',
			green: 'bg-transparent text-[#0CA12D] hover:bg-[#0CA12D]/10 active:bg-[#0CA12D]/20'
		},
		link: {
			orange: 'bg-primary text-white font-medium hover:bg-[#FF4E17] active:bg-primary/80',
			white: 'bg-neutral-900 text-neutral-400 hover:text-white active:bg-neutral-800 active:text-white',
			grey: 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 active:bg-neutral-800 active:text-white',
			green: 'bg-[#0CA12D] text-white font-medium hover:bg-[#07AF2C] active:bg-[#0CA12D]/80'
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
		},
		link: {
			sm: 'text-sm px-6 py-1 rounded-md min-w-[140px] whitespace-nowrap',
			md: 'text-sm px-6 py-1 rounded-md min-w-[140px] whitespace-nowrap',
			lg: 'text-sm px-6 py-1 rounded-md min-w-[140px] whitespace-nowrap'
		}
	};

	// Compute final classes
	const computedClasses = $derived(
		`${baseStyles} ${variantStyles[variant][color]} ${sizeStyles[variant][size]} ${cost !== undefined ? '!px-4' : ''} ${className}`
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
		{#if cost !== undefined}
			<span class="ml-auto flex items-center gap-1">
				{cost}
				<img src="/credit.svg" alt="credit" class="w-5 h-5" />
			</span>
		{/if}
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={computedClasses}
		{...restProps}
	>
		{@render children?.()}
		{#if cost !== undefined}
			<span class="ml-auto flex items-center gap-1">
				{cost}
				<img src="/credit.svg" alt="credit" class="w-5 h-5" />
			</span>
		{/if}
	</button>
{/if}
