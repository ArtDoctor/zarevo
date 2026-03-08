<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import { currentUser, pb } from '$lib/pocketbase';
	import { showAuthModal, authModalMode, requestSignIn, requestSignUp } from '$lib/stores/auth-modal';
	import { goto } from '$app/navigation';
	import { browser, dev } from '$app/environment';

	interface UserRecord {
		credits?: number;
	}

	let { data, children } = $props();

	const credits = $derived(($currentUser as UserRecord | null)?.credits ?? 0);

	$effect(() => {
		if (browser && pb.authStore.isValid) {
			pb.collection('users').authRefresh().catch(() => {});
		}
	});

	let profilePopupOpen = $state(false);
	let profileMenuEl = $state<HTMLDivElement | undefined>(undefined);

	$effect(() => {
		if (!profilePopupOpen) return;
		function handleClickOutside(e: MouseEvent) {
			if (profileMenuEl && !profileMenuEl.contains(e.target as Node)) {
				profilePopupOpen = false;
			}
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	function handleLogout() {
		profilePopupOpen = false;
		pb.authStore.clear();
		goto('/home', { replaceState: true });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if !dev}
		<script defer src="https://umami-s044kkk.yza.yazero.io/script.js" data-website-id="c7127cf8-b1f2-4373-b6f8-e869b652c7e8"></script>
	{/if}
</svelte:head>

<header class="sticky top-0 z-40 border-b surface-blur">
	<nav class="max-w-6xl mx-auto px-4 py-3 flex items-center">
		<a href={$currentUser ? "/" : "/home"} class="text-lg font-semibold shrink-0">
			Zarevo
		</a>

		{#if $currentUser}
			<div class="flex items-center gap-3 ml-auto">
				<span class="text-sm font-mono text-muted" title="Credits">
					{credits} credits
				</span>
				<a
					href="/"
					class="btn btn-md btn-secondary"
				>
					New idea
				</a>
				<a
					href="/your-ideas"
					class="btn btn-md btn-secondary"
				>
					Your ideas
				</a>
				<div class="relative" bind:this={profileMenuEl}>
					<button
						type="button"
						onclick={() => (profilePopupOpen = !profilePopupOpen)}
						class="p-2 rounded-md border border-neutral-700 hover:bg-neutral-800 transition-colors"
						aria-label="Profile menu"
					>
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
					</button>
					{#if profilePopupOpen}
						<div
							class="absolute right-0 mt-1 py-1 w-40 surface-blur z-50"
						>
							<a
								href="/profile"
								onclick={() => (profilePopupOpen = false)}
								class="block px-4 py-2 text-sm hover:bg-neutral-800 rounded-md"
							>
								Profile
							</a>
							<button
								type="button"
								onclick={handleLogout}
								class="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 rounded-md"
							>
								Sign out
							</button>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex-1 flex justify-center gap-12 mx-8">
				<a
					href="/features"
					class="px-3 py-2 text-sm font-medium text-muted hover:text-white transition-colors"
				>
					Features
				</a>
				<a
					href="/pricing"
					class="px-3 py-2 text-sm font-medium text-muted hover:text-white transition-colors"
				>
					Pricing
				</a>
				<a
					href="/faq"
					class="px-3 py-2 text-sm font-medium text-muted hover:text-white transition-colors"
				>
					FAQ
				</a>
			</div>
			<div class="flex items-center gap-3 shrink-0">
				<button
					type="button"
					onclick={requestSignIn}
					class="btn btn-md btn-ghost"
				>
					Sign in
				</button>
				<button
					type="button"
					onclick={requestSignUp}
					class="btn btn-md btn-primary"
				>
					Sign up
				</button>
			</div>
		{/if}
	</nav>
</header>

<main class="min-h-[calc(100vh-56px)]">
	{@render children()}
</main>

{#if $showAuthModal}
	<AuthModal
		mode={$authModalMode}
		authProviders={data.authProviders ?? []}
		onclose={() => showAuthModal.set(false)}
	/>
{/if}
