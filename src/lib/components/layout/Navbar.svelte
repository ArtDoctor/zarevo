<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		authenticated?: boolean;
		credits?: number;
		ideasValidated?: number;
		onSignIn?: () => void;
		onSignUp?: () => void;
		onLogout?: () => void;
		profileMenuOpen?: boolean;
		onProfileMenuToggle?: () => void;
		profileMenuRef?: HTMLDivElement | undefined;
	}

	let {
		authenticated = false,
		credits = 0,
		ideasValidated = 3354,
		onSignIn,
		onSignUp,
		onLogout,
		profileMenuOpen = false,
		onProfileMenuToggle,
		profileMenuRef = $bindable()
	}: Props = $props();
</script>

<nav class="bg-neutral-950 px-4 py-2 border-b border-neutral-800">
	<div class="max-w-[2000px] mx-auto">
		{#if authenticated}
			<!-- Authenticated Layout -->
			<div class="flex items-center justify-between gap-4 lg:gap-6">
				<!-- Logo & Ideas Validated -->
				<div class="flex items-center gap-4">
					<a href="/" class="text-base font-semibold shrink-0 flex items-center gap-2">
						<img src="/zarevo-logo.svg" alt="Zarevo" class="h-[22px]" />
					</a>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-3 lg:gap-4">
					<div class="flex items-center gap-1" title="Credits">
						<span class="text-sm font-medium text-neutral-400">
							{credits}
						</span>
						<img src="/zarevo-icon.svg" alt="Credits" class="w-4 h-4" />
					</div>
					<div class="flex items-center gap-1">
						<Button href="/your-ideas" variant="link" color="grey" size="md">
							Your ideas
						</Button>
						<Button href="/" variant="link" color="orange" size="md">
							New idea
						</Button>
						<div class="relative" bind:this={profileMenuRef}>
							<Button variant="icon" color="grey" size="md" title="Profile" onclick={onProfileMenuToggle}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<circle cx="12" cy="10" r="3" />
									<path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
								</svg>
							</Button>
							{#if profileMenuOpen}
								<div class="absolute right-0 mt-1 p-1 w-40 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-50">
									<a
										href="/profile"
										class="block px-4 py-2 text-sm hover:bg-neutral-800 rounded-md"
									>
										Profile
									</a>
									<button
										type="button"
										onclick={onLogout}
										class="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 rounded-md"
									>
										Sign out
									</button>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Unauthenticated Layout -->
			<!-- Desktop: single row | Mobile/Tablet: 2 rows -->
			<div class="flex flex-col gap-3 lg:gap-0">
				<!-- Row 1: Logo + Ideas + Credits + Sign Up (always visible) -->
				<div class="flex items-center justify-between gap-4 lg:gap-6">
					<!-- Logo & Ideas Validated -->
					<div class="flex items-center gap-4">
						<a href="/home" class="text-base font-semibold shrink-0 flex items-center gap-2">
							<img src="/zarevo-logo.svg" alt="Zarevo" class="h-[22px]" />
						</a>
						<span class="text-xs text-neutral-500 hidden lg:inline">
							<span class="font-medium text-white">{ideasValidated.toLocaleString()} </span> ideas validated
						</span>
					</div>

					<!-- Desktop: Nav Links (centered) -->
					<div class="hidden lg:flex items-center flex-1 justify-center gap-1">
						<a href="/home#features" class="w-full text-sm text-neutral-400 hover:text-white transition-colors">
							<Button variant="link" color="grey" size="md" class="w-full">
								Features
							</Button>
						</a>
						<a href="/home#pricing" class="w-full text-sm text-neutral-400 hover:text-white transition-colors">
							<Button variant="link" color="grey" size="md" class="w-full">
								Pricing
							</Button>
						</a>
						<a href="/home#faq" class="w-full text-sm text-neutral-400 hover:text-white transition-colors">
							<Button variant="link" color="grey" size="md" class="w-full">
								FAQ
							</Button>
						</a>
					</div>

					<!-- Credits & Sign Up -->
					<div class="flex items-center gap-3 lg:gap-4">
						<div class="flex items-center gap-1" title="Credits">
							<span class="text-sm font-medium text-neutral-400">
								{credits}
							</span>
							<img src="/zarevo-icon.svg" alt="Credits" class="w-4 h-4" />
						</div>
						<Button variant="link" color="orange" size="md" onclick={onSignIn}>
							Sign in
						</Button>
					</div>
				</div>

				<!-- Row 2: Nav Links (mobile/tablet only) -->
				<div class="flex lg:hidden items-center gap-1">
					<a href="/home#features" class="w-full text-sm text-neutral-400 hover:text-white transition-colors">
						<Button variant="link" color="grey" size="md" class="w-full">
							Features
						</Button>
					</a>
					<a href="/home#pricing" class="w-full text-sm text-neutral-400 hover:text-white transition-colors">
						<Button variant="link" color="grey" size="md" class="w-full">
							Pricing
						</Button>
					</a>
					<a href="/home#faq" class="w-full text-sm text-neutral-400 hover:text-white transition-colors">
						<Button variant="link" color="grey" size="md" class="w-full">
							FAQ
						</Button>
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>
