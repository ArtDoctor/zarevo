<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentUser, pb } from '$lib/pocketbase';
	import IdeaInput from '$lib/components/IdeaInput.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { setValidationForm } from '$lib/stores/validation-form';
	import { requestSignIn } from '$lib/stores/auth-modal';
	import { createIdeaAndNavigate, createIdeaAdvancedAndNavigate } from '$lib/api/ideas';

	interface UserRecord {
		credits?: number;
	}

	let submitting = $state(false);
	let error = $state<string | null>(null);
	let creditAmount = $state(72);

	const user = $derived($currentUser as UserRecord | null);
	const credits = $derived(user?.credits ?? 0);

	function calculatePrice(credits: number): number {
		const basePrice = 0.20;
		const discount = Math.min((credits - 24) / 476 * 0.30, 0.30);
		const pricePerCredit = basePrice * (1 - discount);
		return Math.round(credits * pricePerCredit);
	}

	function calculatePricePerCredit(credits: number): string {
		const totalPrice = calculatePrice(credits);
		return (totalPrice / credits).toFixed(2);
	}

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
	<title>Home - Zarevo</title>
	<script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.67/build/spline-viewer.js"></script>
</svelte:head>

<style>
	input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 30px;
		height: 20px;
		border-radius: 2px;
		background: #F05322;
		cursor: pointer;
	}

	input[type="range"]::-moz-range-thumb {
		width: 30px;
		height: 20px;
		border-radius: 2px;
		background: #F05322;
		cursor: pointer;
	}
</style>

<!-- Hero Section -->
<section class="min-h-[90vh] w-screen bg-linear-to-b from-neutral-900 to-neutral-950 -mx-3 relative left-1/2 right-1/2 -translate-x-1/2 overflow-hidden">
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
				advancedPath="/home/more-options"
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

<!-- Intro Section -->
<section class="p-2 lg:p-12 mt-24 rounded-lg" style="background-image: url('/cubes-bg.png'); background-size: cover; background-position: center;">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center">
			<!-- Left Container - Text -->
			<div class="flex flex-col justify-between h-full bg-neutral-950 rounded-md p-6">
				<h2 class="text-xl lg:text-2xl md:text-2xl text-white mb-12">
					A tool for complex startup idea <span class="text-primary font-semibold">validation.</span><br />
					Ideas in. Unicorn ideas out.
				</h2>
				<p class="lg:text-lg leading-6 text-white">
					Picking a strong idea that solves a real problem<br />
					and can actually make money is <span class="text-primary font-semibold">very important.</span>
				</p>
			</div>

			<!-- Right Container - Mockup Image with Backdrop Blur -->
			<div class="flex items-end justify-end rounded-md pl-6 pt-6 overflow-hidden" style="background-color: rgba(10, 10, 10, 0.7); backdrop-filter: blur(35px); -webkit-backdrop-filter: blur(35px);">
				<img src="/idea-page-mockup.svg" alt="Idea validation mockup" class="w-full h-auto" />
			</div>
		</div>
</section>

<!-- Features Section -->
<section id="features" class="p-2 lg:p-12 mt-24 rounded-lg bg-neutral-800">
	<div class="flex flex-col lg:flex-row gap-2 items-stretch">
		<!-- Left Container - Basic validation -->
		<div class="flex flex-col justify-between w-full lg:w-1/3 bg-neutral-950/70 rounded-md p-6">
			<div>
				<h2 class="text-2xl text-white mb-6">Basic validation</h2>
				
				<div class="space-y-4">
					<div>
						<h3 class="text-white mb-1">Market analysis</h3>
						<p class="text-sm text-neutral-400">Understand the market conditions for your idea.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Competitor analysis</h3>
						<p class="text-sm text-neutral-400">Find and understand competitors, see how you can win.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Problem analysis</h3>
						<p class="text-sm text-neutral-400">Understand and refine the problem your idea solves.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Customer analysis</h3>
						<p class="text-sm text-neutral-400">Identify your target customers and their pain points.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Overall score</h3>
						<p class="text-sm text-neutral-400">Get a comprehensive viability score for your startup idea.</p>
					</div>
				</div>
			</div>
			
			<div class="mt-6 pt-4">
				<p class="text-sm text-white flex items-center gap-1">Cost: 1<img src="/credit.svg" alt="credit" class="w-4 h-4 inline" /></p>
			</div>
		</div>

		<!-- Right Container - Advanced validation -->
		<div class="flex flex-col justify-between w-full lg:w-2/3 bg-neutral-950 rounded-md p-6">
			<div>
				<h2 class="text-2xl text-white mb-6">Advanced validation</h2>
				
				<div class="grid grid-cols-2 gap-4 mb-6">
					<div>
						<h3 class="text-white mb-1">All in Basic validation</h3>
						<p class="text-sm text-neutral-400">Everything from basic validation plus deeper insights.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Technical analysis</h3>
						<p class="text-sm text-neutral-400">Evaluate technical feasibility and implementation challenges.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Legal analysis</h3>
						<p class="text-sm text-neutral-400">Identify regulatory requirements and legal considerations.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Financial analysis</h3>
						<p class="text-sm text-neutral-400">Assess revenue potential, costs, and funding requirements.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">SWOT analysis</h3>
						<p class="text-sm text-neutral-400">Examine strengths, weaknesses, opportunities, and threats.</p>
					</div>
					
					<div>
						<h3 class="text-white mb-1">Overall score</h3>
						<p class="text-sm text-neutral-400">Advanced scoring with detailed breakdown and recommendations.</p>
					</div>
				</div>
				
				<div class="mb-4">
					<h3 class="text-orange-500 mb-3">Access to advanced features</h3>
					
					<div class="grid grid-cols-2 gap-2">
						<div class="bg-neutral-800 rounded-md p-4">
							<h4 class="text-white mb-1">Smoke test</h4>
							<p class="text-sm text-neutral-400">Validate demand with a landing page before building. Test your value proposition with real users and collect early sign-ups.</p>
							<a href="#" class="text-sm text-white inline-block mt-2">Learn more →</a>
						</div>
						
						<div class="bg-neutral-800 rounded-md p-4">
							<h4 class="text-white mb-1">Brainstorm</h4>
							<p class="text-sm text-neutral-400">Generate variations and pivots of your idea. Explore alternative approaches, business models, and market angles.</p>
							<a href="#" class="text-sm text-white inline-block mt-2">Learn more →</a>
						</div>
						
						<div class="bg-neutral-800 rounded-md p-4">
							<h4 class="text-white mb-1">MVP build</h4>
							<p class="text-sm text-neutral-400">Get a detailed roadmap for building your minimum viable product. Prioritized features, tech stack recommendations, and timeline.</p>
							<a href="#" class="text-sm text-white inline-block mt-2">Learn more →</a>
						</div>
						
						<div class="bg-neutral-800 rounded-md p-4">
							<h4 class="text-white mb-1">VC search</h4>
							<p class="text-sm text-neutral-400">Find investors that match your startup. Get a curated list of VCs interested in your industry, stage, and geography.</p>
							<a href="#" class="text-sm text-white inline-block mt-2">Learn more →</a>
						</div>
					</div>
				</div>
			</div>
			
			<div class="mt-6 pt-4 flex justify-between items-center">
				<p class="text-sm text-white flex items-center gap-1">Cost: 5<img src="/credit.svg" alt="credit" class="w-4 h-4 inline" /></p>
				<p class="text-xs text-neutral-500">Powered by Zarevo research engine</p>
			</div>
		</div>
	</div>
</section>

	<!-- Pricing Section -->
	<section id="pricing" class="p-2 lg:p-12 mt-24 rounded-lg bg-neutral-800">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-2 items-stretch">
			<!-- Left Container - Pay as you go -->
			<div class="flex flex-col justify-between bg-neutral-950 rounded-md p-6">
				<div>
					<div class="flex items-center gap-2 mb-6">
						<h2 class="text-5xl text-white font-light">{creditAmount}</h2>
						<img src="/credit.svg" alt="credit" class="w-6 h-6" />
					</div>
					
					<input 
						type="range" 
						min="24" 
						max="500" 
						step="1" 
						bind:value={creditAmount}
						class="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer mb-6"
						style="background: linear-gradient(to right, #F05322 0%, #F05322 {((creditAmount - 24) / (500 - 24)) * 100}%, #404040 {((creditAmount - 24) / (500 - 24)) * 100}%, #404040 100%);"
					/>
				</div>
				
				<div>
					<button class="w-full bg-white text-black py-3 px-6 rounded-md font-medium hover:bg-neutral-100 transition-colors">
						Buy for {calculatePrice(creditAmount)}$
					</button>
					<p class="text-sm text-neutral-400 text-right mt-2">{calculatePricePerCredit(creditAmount)}$/credit</p>
				</div>
			</div>

			<!-- Right Container - Unlimited subscription -->
			<div class="flex flex-col justify-between bg-neutral-950/70 rounded-md p-6">
				<div>
					<h2 class="text-2xl text-white mb-6">Unlimited</h2>
					
					<div class="space-y-3">
						<div class="flex items-start gap-2">
							<span class="text-primary mt-1">✦</span>
							<p class="text-white">Unlimited ideas</p>
						</div>
						
						<div class="flex items-start gap-2">
							<span class="text-primary mt-1">✦</span>
							<p class="text-white">Access to all advanced features</p>
						</div>
					</div>
				</div>
				
				<div class="mt-6">
					<button class="w-full bg-neutral-800 text-white py-3 px-6 rounded-md font-medium hover:bg-neutral-700 transition-colors">
						Buy for 149$/month
					</button>
				</div>
			</div>
		</div>
	</section>

<!-- FAQ Section -->
<section id="faq" class="p-2 lg:p-12 mt-24 rounded-lg">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
		<!-- Left Column -->
		<div class="space-y-2">
			<details class="bg-neutral-950 rounded-md px-6 py-2 group">
				<summary class="text-white cursor-pointer list-none flex items-center justify-between">
					<span>How does Zarevo work?</span>
					<span class="text-2xl transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="text-sm text-neutral-400 my-2">Zarevo uses advanced AI to analyze your startup idea across multiple dimensions including market, competition, customers, and financials. Simply describe your idea and get comprehensive validation reports in minutes.</p>
			</details>
			
			<details class="bg-neutral-950 rounded-md px-6 py-2 group">
				<summary class="text-white cursor-pointer list-none flex items-center justify-between">
					<span>Can I try it first?</span>
					<span class="text-2xl transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="text-sm text-neutral-400 my-2">Yes! Sign up and get free credits to validate your first idea. You can test the basic validation features before committing to any purchase.</p>
			</details>
			
			<details class="bg-neutral-950 rounded-md px-6 py-2 group">
				<summary class="text-white cursor-pointer list-none flex items-center justify-between">
					<span>Why do I need idea validation?</span>
					<span class="text-2xl transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="text-sm text-neutral-400 my-2">Most startups fail because they build something nobody wants. Validating your idea early helps you understand market demand, competition, and potential challenges before investing significant time and money.</p>
			</details>
		</div>
		
		<!-- Right Column -->
		<div class="space-y-2">
			<details class="bg-neutral-950 rounded-md px-6 py-2 group">
				<summary class="text-white cursor-pointer list-none flex items-center justify-between">
					<span>Who is Zarevo for?</span>
					<span class="text-2xl transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="text-sm text-neutral-400 my-2">Zarevo is perfect for aspiring entrepreneurs, founders validating new ideas, product managers exploring opportunities, and anyone looking to test a business concept before building.</p>
			</details>
			
			<details class="bg-neutral-950 rounded-md px-6 py-2 group">
				<summary class="text-white cursor-pointer list-none flex items-center justify-between">
					<span>How is Zarevo different than any LLM?</span>
					<span class="text-2xl transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="text-sm text-neutral-400 my-2">Unlike generic LLMs, Zarevo is specifically trained on startup validation frameworks and uses a structured research engine to provide comprehensive, actionable insights rather than generic advice.</p>
			</details>
			
			<details class="bg-neutral-950 rounded-md px-6 py-2 group">
				<summary class="text-white cursor-pointer list-none flex items-center justify-between">
					<span>Are my ideas secure?</span>
					<span class="text-2xl transition-transform group-open:rotate-45">+</span>
				</summary>
				<p class="text-sm text-neutral-400 my-2">Absolutely. Your ideas are encrypted and stored securely. We never share your data with third parties, and you maintain full ownership of all your submissions and reports.</p>
			</details>
		</div>
	</div>
</section>

<Footer />
