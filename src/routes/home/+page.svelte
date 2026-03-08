<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import IdeaInput from '$lib/components/IdeaInput.svelte';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';

	interface UserRecord {
		credits?: number;
	}

	let submitting = $state(false);
	let error = $state<string | null>(null);

	const user = $derived($currentUser as UserRecord | null);
	const credits = $derived(user?.credits ?? 0);

	onMount(() => {
		if (pb.authStore.isValid) {
			goto('/', { replaceState: true });
		}

		const hash = window.location.hash;
		if (hash) {
			setTimeout(() => {
				const element = document.querySelector(hash);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
				}
			}, 100);
		}
	});

	async function handleSubmit(startupIdea: string) {
		setValidationForm({ startupIdea, validationType: 'basic' });
		if (!pb.authStore.isValid) {
			requestSignIn();
			return;
		}
		if (credits < 1) {
			error = 'Basic validation requires at least 1 credit';
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAndNavigate({
				description: startupIdea,
				problem: '',
				customer: '',
				founder_specific: ''
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create idea';
		} finally {
			submitting = false;
		}
	}

	async function handleSubmitPro(startupIdea: string) {
		setValidationForm({ startupIdea, validationType: 'pro' });
		if (!pb.authStore.isValid) {
			requestSignIn();
			return;
		}
		if (credits < 4) {
			error = 'Pro validation requires at least 4 credits';
			return;
		}
		submitting = true;
		error = null;
		try {
			await createIdeaAdvancedAndNavigate({
				description: startupIdea,
				problem: '',
				customer: '',
				founder_specific: ''
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create idea';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.67/build/spline-viewer.js"></script>
</svelte:head>

<!-- Hero Section -->
<section class="min-h-[80vh] w-screen bg-linear-to-b from-neutral-900 to-neutral-950 -mx-3 relative left-1/2 right-1/2 -translate-x-1/2 overflow-hidden">
	<div class="flex flex-col items-center justify-center px-4 relative z-10 min-h-[80vh]">
		<div class="w-full max-w-2xl">
			<h1 class="text-3xl md:text-4xl text-zinc-800 dark:text-zinc-200 mb-8">
				Imagine a startup. <br /><span class="text-primary">Now validate it.</span>
			</h1>

			{#if error}
				<p class="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
			{/if}
			<IdeaInput
				onSubmit={handleSubmit}
				onSubmitPro={handleSubmitPro}
				advancedPath="/home/advanced"
				credits={credits}
				isAuthenticated={pb.authStore.isValid}
				disabled={submitting}
			/>
		</div>
	</div>
	
	<!-- Spline Animation -->
	<div class="absolute bottom-0 left-0 w-full h-[400px] z-0">
		<spline-viewer url="https://prod.spline.design/FVYpaJUhLfAnywyj/scene.splinecode" class="w-full h-full"></spline-viewer>
	</div>
</section>

<!-- Features Section -->
	<section id="features" class="py-20 px-4">
		<div class="max-w-4xl mx-auto">
			<h2 class="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Features</h2>
			<p class="text-lg text-zinc-600 dark:text-zinc-400">Overview of product features and capabilities.</p>
		</div>
	</section>

	<!-- Pricing Section -->
	<section id="pricing" class="py-20 px-4 bg-neutral-900/30">
		<div class="max-w-4xl mx-auto">
			<h2 class="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">Pricing</h2>
			<p class="text-lg text-zinc-600 dark:text-zinc-400">Plans and pricing options.</p>
		</div>
	</section>

<!-- FAQ Section -->
<section id="faq" class="py-20 px-4">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">FAQ</h2>
		<p class="text-lg text-zinc-600 dark:text-zinc-400">Frequently asked questions.</p>
	</div>
</section>
