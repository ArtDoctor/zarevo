<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import Button from '$lib/components/ui/Button.svelte';

	interface UserRecord {
		id: string;
		email?: string;
		name?: string;
		avatar?: string;
		credits?: number;
	}

	let editingName = $state(false);
	let newName = $state('');
	let savingName = $state(false);
	let nameError = $state<string | null>(null);
	let deleteConfirmOpen = $state(false);
	let deleteConfirmText = $state('');
	let deleting = $state(false);
	let deleteError = $state<string | null>(null);

	const user = $derived($currentUser as UserRecord | null);

	const displayName = $derived(user?.name?.trim() || user?.email?.split('@')[0] || 'User');
	const avatarUrl = $derived(
		user?.avatar && user ? pb.files.getURL(user, user.avatar) : null
	);
	const credits = $derived(user?.credits ?? 0);

	onMount(() => {
		if (!pb.authStore.isValid) {
			goto('/home', { replaceState: true });
		}
	});

	function startEditName() {
		newName = user?.name ?? '';
		nameError = null;
		editingName = true;
	}

	function cancelEditName() {
		editingName = false;
		newName = '';
		nameError = null;
	}

	async function saveName() {
		if (!user?.id) return;
		const trimmed = newName.trim();
		if (!trimmed) {
			nameError = 'Name cannot be empty';
			return;
		}
		savingName = true;
		nameError = null;
		try {
			const updated = await pb.collection('users').update(user.id, { name: trimmed });
			pb.authStore.save(pb.authStore.token, updated);
			editingName = false;
			newName = '';
		} catch (e) {
			nameError = e instanceof Error ? e.message : 'Failed to update name';
		} finally {
			savingName = false;
		}
	}

	function openDeleteConfirm() {
		deleteConfirmOpen = true;
		deleteConfirmText = '';
		deleteError = null;
	}

	function closeDeleteConfirm() {
		deleteConfirmOpen = false;
		deleteConfirmText = '';
		deleteError = null;
	}

	async function deleteProfile() {
		if (!user?.id) return;
		if (deleteConfirmText.toLowerCase() !== 'delete') {
			deleteError = 'Type "delete" to confirm';
			return;
		}
		deleting = true;
		deleteError = null;
		try {
			await pb.collection('users').delete(user.id);
			pb.authStore.clear();
			goto('/home', { replaceState: true });
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete account';
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Profile - Zarevo</title>
</svelte:head>

<div class="max-w-2xl mx-auto py-12 px-4">
	<h1 class="text-2xl">Profile</h1>
	<p class="mt-1 text-neutral-400">Your account settings and preferences.</p>

	{#if user}
		<div class="mt-8 space-y-2">
			<div class="flex items-center gap-6 p-6 rounded-lg bg-neutral-800">
				<div
					class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-neutral-400 bg-neutral-700 shrink-0 overflow-hidden"
				>
					{#if avatarUrl}
						<img src={avatarUrl} alt="" class="w-full h-full object-cover" />
					{:else}
						{displayName.charAt(0).toUpperCase()}
					{/if}
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm text-neutral-400">{user.email}</div>
					{#if editingName}
						<form
							onsubmit={(e) => {
								e.preventDefault();
								saveName();
							}}
							class="mt-2 flex flex-wrap items-center gap-2"
						>
							<input
								type="text"
								bind:value={newName}
								placeholder="Your name"
								class="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2"
								style="--tw-ring-color: var(--color-primary);"
							/>
							<button
								type="submit"
								disabled={savingName}
								class="btn btn-sm btn-primary"
							>
								{savingName ? 'Saving...' : 'Save'}
							</button>
							<button
								type="button"
								onclick={cancelEditName}
								disabled={savingName}
								class="px-3 py-2 rounded-lg border border-neutral-600 hover:bg-neutral-800 text-sm disabled:opacity-50"
							>
								Cancel
							</button>
						</form>
						{#if nameError}
							<p class="mt-1 text-sm text-red-400">{nameError}</p>
						{/if}
					{:else}
						<div class="flex items-center gap-2 mt-1">
							<span class="text-lg font-medium text-neutral-200">{displayName}</span>
							<button
								type="button"
								onclick={startEditName}
								class="text-sm text-primary hover:underline"
							>
								Change name
							</button>
						</div>
					{/if}
				</div>
			</div>

			<div class="p-6 rounded-lg bg-neutral-800">
				<h2 class="text-sm font-medium text-neutral-400">Credits</h2>
				<div class="mt-1 flex items-center gap-2">
					<p class="text-2xl font-semibold text-neutral-200">{credits}</p>
					<img src="/credit.svg" alt="credit" class="w-6 h-6" />
				</div>
			</div>

			<div class="mt-6 pt-3 border-t border-neutral-700">
				<Button variant="normal" color="red" size="md" onclick={openDeleteConfirm}>
					Delete account
				</Button>
			</div>
		</div>
	{:else}
		<p class="mt-8 text-neutral-400">Loading...</p>
	{/if}
</div>

{#if deleteConfirmOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-dialog-title"
	>
		<div class="relative z-10 w-full max-w-md rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl p-6">
			<h2 id="delete-dialog-title" class="text-lg font-semibold text-neutral-200">
				Delete account
			</h2>
			<p class="mt-2 text-sm text-neutral-400">
				This will permanently delete your account and all associated data. This action cannot be undone.
			</p>
			<p class="mt-4 text-sm text-neutral-400">
				Type <strong>delete</strong> to confirm:
			</p>
			<input
				type="text"
				bind:value={deleteConfirmText}
				placeholder="delete"
				class="mt-2 w-full px-4 py-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
			/>
			{#if deleteError}
				<p class="mt-2 text-sm text-red-400">{deleteError}</p>
			{/if}
			<div class="mt-6 flex gap-3 justify-end">
				<button
					type="button"
					onclick={closeDeleteConfirm}
					disabled={deleting}
					class="px-4 py-2 rounded-lg border border-neutral-600 hover:bg-neutral-800 disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={deleteProfile}
					disabled={deleting || deleteConfirmText.toLowerCase() !== 'delete'}
					class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{deleting ? 'Deleting...' : 'Delete account'}
				</button>
			</div>
		</div>
	</div>
{/if}
