<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data, children } = $props();

	let showAuthModal = $state(false);
	let authModalMode = $state<'signin' | 'signup'>('signin');

	$effect(() => {
		if (data.user) {
			console.log('Logged in:', data.user.email);
		}
	});

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
		await invalidateAll();
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
	<nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
		<a href="/home" class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
			Zarevo
		</a>

		<div class="flex items-center gap-3">
			{#if data.user}
				<span class="text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">
					{data.user.email}
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
					onclick={() => { authModalMode = 'signin'; showAuthModal = true; }}
					class="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
				>
					Sign in
				</button>
				<button
					type="button"
					onclick={() => { authModalMode = 'signup'; showAuthModal = true; }}
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

{#if showAuthModal}
	<AuthModal
		mode={authModalMode}
		authProviders={data.authProviders ?? []}
		onclose={() => { showAuthModal = false; }}
	/>
{/if}
