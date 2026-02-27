<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { validateEmail, validateOTPCode, validatePassword } from '$lib/form-validations/login-validation';
	import { goto } from '$app/navigation';

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
	let password = $state('');
	let passwordConfirm = $state('');
	let otpCode = $state('');
	let otpId = $state<string | null>(null);
	let error = $state('');
	let loading = $state(false);

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

	function onAuthSuccess() {
		closeModal();
		goto('/', { replaceState: true });
	}

	function extractAuthError(e: unknown, fallback: string): string {
		const err = e as {
			response?: { message?: string };
			data?: { message?: string };
			message?: string;
			originalError?: { message?: string };
			cause?: { message?: string };
		};
		return (
			err?.response?.message ??
			err?.data?.message ??
			err?.message ??
			err?.originalError?.message ??
			(err?.cause && typeof err.cause === 'object' && 'message' in err.cause
				? (err.cause as { message?: string }).message
				: undefined) ??
			fallback
		);
	}

	async function handleRequestOTP() {
		error = validateEmail(email);
		if (error !== '') return;
		if (currentMode === 'signup') {
			error = validatePassword(password, passwordConfirm);
			if (error !== '') return;
		}

		loading = true;
		error = '';
		try {
			if (currentMode === 'signup') {
				await pb.collection('users').create({
					email,
					password,
					passwordConfirm: passwordConfirm,
					emailVisibility: false
				});
			}
			const result = await pb.collection('users').requestOTP(email);
			otpId = result.otpId;
		} catch (e: unknown) {
			error = extractAuthError(
				e,
				currentMode === 'signup'
					? 'Could not create account. Email may already be in use.'
					: 'Could not send code. Check your email address.'
			);
		} finally {
			loading = false;
		}
	}

	async function handleVerifyOTP() {
		if (!otpId) return;
		error = validateOTPCode(otpCode);
		if (error !== '') return;

		loading = true;
		error = '';
		try {
			await pb.collection('users').authWithOTP(otpId, otpCode);
			onAuthSuccess();
		} catch (e: unknown) {
			error = extractAuthError(e, 'Invalid or expired code. Please try again.');
		} finally {
			loading = false;
		}
	}

	function handleBack() {
		otpId = null;
		otpCode = '';
		password = '';
		passwordConfirm = '';
		error = '';
	}

	async function handleOAuth(providerName: string) {
		error = '';
		loading = true;

		try {
			await pb.collection('users').authWithOAuth2({ provider: providerName });
			onAuthSuccess();
		} catch (e: unknown) {
			error = extractAuthError(e, 'OAuth login failed. Please try again.');
		} finally {
			loading = false;
		}
	}

	function switchMode() {
		currentMode = currentMode === 'signin' ? 'signup' : 'signin';
		otpId = null;
		otpCode = '';
		password = '';
		passwordConfirm = '';
		error = '';
	}

	const googleProvider = $derived(authProviders.find((p) => p.name === 'google'));
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
				{otpId ? 'Enter verification code' : currentMode === 'signin' ? 'Sign in' : 'Sign up'}
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

		{#if otpId}
			<div class="space-y-4">
				<p class="text-sm text-zinc-600 dark:text-zinc-400">
					We sent a code to <strong>{email}</strong>
				</p>
				<div>
					<label for="otp" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Verification code
					</label>
					<input
						id="otp"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						bind:value={otpCode}
						placeholder="Enter code from email"
						class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
					/>
				</div>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={handleBack}
						disabled={loading}
						class="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
					>
						Back
					</button>
					<button
						type="button"
						onclick={handleVerifyOTP}
						disabled={loading}
						class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
					>
						{loading ? 'Verifying...' : 'Verify'}
					</button>
				</div>
			</div>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); handleRequestOTP(); }} class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Enter your email"
						class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
					/>
				</div>

				{#if currentMode === 'signup'}
					<div>
						<label for="password" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
							Password
						</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="At least 8 characters"
							class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
						/>
					</div>
					<div>
						<label for="passwordConfirm" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
							Confirm password
						</label>
						<input
							id="passwordConfirm"
							type="password"
							bind:value={passwordConfirm}
							placeholder="Repeat your password"
							class="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
						/>
					</div>
				{/if}

				{#if googleProvider}
					<button
						type="button"
						disabled={loading}
						onclick={() => handleOAuth(googleProvider.name)}
						class="w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
					>
						<svg class="w-5 h-5" viewBox="0 0 24 24">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						Continue with {googleProvider.displayName}
					</button>
				{/if}

				<div class="relative my-6">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-zinc-200 dark:border-zinc-600"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white dark:bg-zinc-900 text-zinc-500">or</span>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
				>
					{loading ? 'Sending code...' : (currentMode === 'signin' ? 'Send sign-in code' : 'Create account & send code')}
				</button>
			</form>
		{/if}

		{#if !otpId}
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
		{/if}
	</div>
</div>
