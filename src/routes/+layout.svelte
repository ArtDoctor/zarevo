<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AuthModal from '$lib/components/AuthModal.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
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

	// Sync client-side auth to cookie for server-side access
	$effect(() => {
		if (browser) {
			// Manually construct the cookie to ensure it's set correctly
			const authData = {
				token: pb.authStore.token,
				model: pb.authStore.model
			};
			const cookieValue = encodeURIComponent(JSON.stringify(authData));
			const cookieString = `pb_auth=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
			document.cookie = cookieString;
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
		// Clear the auth cookie
		document.cookie = 'pb_auth=; path=/; max-age=0';
		// Use full page navigation to ensure server processes the cleared auth
		window.location.href = '/home';
	}

	function toggleProfileMenu() {
		profilePopupOpen = !profilePopupOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if !dev}
		<script defer src="https://umami-s044kkk.yza.yazero.io/script.js" data-website-id="c7127cf8-b1f2-4373-b6f8-e869b652c7e8"></script>
	{/if}
</svelte:head>

<Navbar
	authenticated={!!$currentUser}
	credits={credits}
	onSignIn={requestSignIn}
	onSignUp={requestSignUp}
	onLogout={handleLogout}
	profileMenuOpen={profilePopupOpen}
	onProfileMenuToggle={toggleProfileMenu}
	bind:profileMenuRef={profileMenuEl}
/>

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
