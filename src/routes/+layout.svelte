<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import { currentUser, pb } from '$lib/pocketbase';
	import { showAuthModal, authModalMode } from '$lib/stores/auth-modal';
	import { goto } from '$app/navigation';

	let { data, children } = $props();

	function handleLogout() {
		pb.authStore.clear();
		goto('/home', { replaceState: true });
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
	<nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
		<a href="/home" class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
			Zarevo
		</a>

		<div class="flex items-center gap-3">
			{#if $currentUser}
				<span class="text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">
					{$currentUser?.username ?? $currentUser?.email ?? 'User'}
				</span>
				<button
					type="button"
					onclick={handleLogout}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
				>
					Sign out
				</button>
			{:else}
				<button
					type="button"
					onclick={() => { authModalMode.set('signin'); showAuthModal.set(true); }}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
				>
					Sign in
				</button>
				<button
					type="button"
					onclick={() => { authModalMode.set('signup'); showAuthModal.set(true); }}
					class="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
				>
					Sign up
				</button>
			{/if}
		</div>
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
