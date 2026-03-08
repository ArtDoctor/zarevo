<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { requestSignUp } from '$lib/stores/auth-modal';

	onMount(() => {
		if (pb.authStore.isValid) {
			goto('/', { replaceState: true });
		}
	});

	function handleSignUp() {
		requestSignUp(11);
	}
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center px-4">
	<div
		class="mb-8 p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center max-w-lg"
	>
		<p class="text-lg font-medium text-emerald-400 mb-2">You used a special link!</p>
		<p class="text-zinc-300 dark:text-zinc-400">
			Now you can get <strong class="text-white">3 basic</strong> and
			<strong class="text-white">2 advanced</strong> validations for free!
		</p>
	</div>

	<h2 class="text-2xl md:text-3xl text-center text-zinc-800 dark:text-zinc-200 mb-4">
		Create your account
	</h2>
	<p class="text-zinc-600 dark:text-zinc-400 text-center mb-8 max-w-md">
		Sign up now to claim your 11 free credits and start validating your startup ideas.
	</p>

	<button
		type="button"
		onclick={handleSignUp}
		class="btn btn-lg btn-primary"
	>
		Sign up for free
	</button>

	<p class="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
		Already have an account?
		<a href="/" class="text-primary hover:underline">Sign in</a>
	</p>
</div>
