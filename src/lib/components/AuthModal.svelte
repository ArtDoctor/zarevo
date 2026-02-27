<script lang="ts">
	import { createPocketBaseClient } from '$lib/pocketbase';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		mode: 'signin' | 'signup';
		authProviders: { name: string; displayName: string; authUrl?: string }[];
		onclose?: () => void;
	}

	let { mode = 'signin', authProviders = [], onclose }: Props = $props();

	let currentMode = $state<'signin' | 'signup'>('signin');
	$effect(() => {
		currentMode = mode;
	});
	let email = $state('');
	let otpCode = $state('');
	let otpId = $state<string | null>(null);
	let name = $state('');
	let error = $state('');
	let loading = $state(false);

	const pb = createPocketBaseClient();

	$effect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeModal();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});

	function closeModal() {
		onclose?.();
	}

	async function handleSendCode() {
		error = '';
		loading = true;

		try {
			if (currentMode === 'signup') {
				const randomPassword = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
				await pb.collection('users').create({
					email,
					password: randomPassword,
					passwordConfirm: randomPassword,
					...(name && { name })
				});
			}
			const result = await pb.collection('users').requestOTP(email);
			otpId = result.otpId;
		} catch (e: unknown) {
			const err = e as { response?: { message?: string }; message?: string };
			error = err?.response?.message ?? err?.message ?? 'Failed to send code';
		} finally {
			loading = false;
		}
	}

	async function handleVerifyOTP() {
		if (!otpId) return;
		error = '';
		loading = true;

		try {
			await pb.collection('users').authWithOTP(otpId, otpCode);

			await fetch('/api/auth/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token: pb.authStore.token,
					record: pb.authStore.record
				}),
				credentials: 'include'
			});

			await invalidateAll();
			closeModal();
		} catch (e: unknown) {
			const err = e as { response?: { message?: string }; message?: string };
			error = err?.response?.message ?? err?.message ?? 'Invalid code';
		} finally {
			loading = false;
		}
	}

	async function handleOAuth(providerName: string) {
		error = '';
		loading = true;

		try {
			await pb.collection('users').authWithOAuth2({ provider: providerName });

			await fetch('/api/auth/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token: pb.authStore.token,
					record: pb.authStore.record
				}),
				credentials: 'include'
			});

			await invalidateAll();
			closeModal();
		} catch (e: unknown) {
			const err = e as { response?: { message?: string }; message?: string };
			error = err?.response?.message ?? err?.message ?? 'OAuth failed';
		} finally {
			loading = false;
		}
	}

	function switchMode() {
		currentMode = currentMode === 'signin' ? 'signup' : 'signin';
		otpId = null;
		otpCode = '';
		error = '';
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4"
	role="dialog"
	aria-modal="true"
	aria-labelledby="auth-modal-title"
>
	<button
		type="button"
		class="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default focus:outline-none"
		aria-label="Close modal"
		onclick={closeModal}
	></button>

	<div class="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-xl p-8 border border-zinc-200 dark:border-zinc-700">
		<div class="flex justify-between items-center mb-6">
			<h2 id="auth-modal-title" class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
				{currentMode === 'signin' ? 'Sign in' : 'Sign up'}
			</h2>
			<button
				type="button"
				onclick={closeModal}
				class="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded transition-colors"
				aria-label="Close"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>

		{#if error}
			<div class="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
				{error}
			</div>
		{/if}

		<div class="flex gap-3 mb-6">
			<button
				type="button"
				disabled={loading}
				onclick={() => handleOAuth('google')}
				class="flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				Google
			</button>
			<button
				type="button"
				disabled={loading}
				onclick={() => handleOAuth('github')}
				class="flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 2.003-.404.02-.005.042-.009.062-.009.02 0 .042.004.062.009.02.005 1.047.138 2.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
				GitHub
			</button>
		</div>

		<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-zinc-200 dark:border-zinc-600"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white dark:bg-zinc-900 text-zinc-500">or</span>
				</div>
			</div>

		{#if !otpId}
			<form onsubmit={(e) => { e.preventDefault(); handleSendCode(); }} class="space-y-4">
				{#if currentMode === 'signup'}
					<div>
						<label for="name" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
							Name (optional)
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							placeholder="Your name"
							class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
						/>
					</div>
				{/if}

				<div>
					<label for="email" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						placeholder="you@example.com"
						class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
				>
					{loading ? 'Sending...' : 'Send code'}
				</button>
			</form>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} class="space-y-4">
				<p class="text-sm text-zinc-600 dark:text-zinc-400">
					We sent a code to <strong>{email}</strong>. Enter it below.
				</p>
				<div>
					<label for="otp" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Verification code
					</label>
					<input
						id="otp"
						type="text"
						bind:value={otpCode}
						placeholder="123456"
						inputmode="numeric"
						autocomplete="one-time-code"
						class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-lg tracking-widest"
					/>
				</div>

				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => { otpId = null; otpCode = ''; error = ''; }}
						disabled={loading}
						class="flex-1 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors disabled:opacity-50"
					>
						Back
					</button>
					<button
						type="submit"
						disabled={loading || !otpCode.trim()}
						class="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
					>
						{loading ? 'Verifying...' : 'Verify'}
					</button>
				</div>
			</form>
		{/if}

		<p class="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
			{currentMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
			<button
				type="button"
				onclick={switchMode}
				class="ml-1 font-medium text-amber-600 dark:text-amber-400 hover:underline"
			>
				{currentMode === 'signin' ? 'Sign up' : 'Sign in'}
			</button>
		</p>
	</div>
</div>
