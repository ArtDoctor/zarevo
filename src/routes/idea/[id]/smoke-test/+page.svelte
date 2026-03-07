<script lang="ts">
	import { onMount } from 'svelte';
	import { checkAuth, getAuthHeaders, pb } from '$lib/pocketbase';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getBackendUrl } from '$lib/config';

	interface IdeaFeature {
		title: string;
		description: string;
		expected_signup_increase_pct: number;
	}

	interface Feature {
		id: string;
		label: string;
		description: string;
		signupRate: number;
	}

	type AdvertisedFeature =
		| { type: 'ai'; id: string; label: string; description: string; signupRate: number }
		| { type: 'custom'; label: string };

	function parseFeatures(raw: unknown): Feature[] {
		if (!Array.isArray(raw)) return [];
		return raw
			.filter(
				(item): item is IdeaFeature =>
					item != null &&
					typeof item === 'object' &&
					typeof (item as IdeaFeature).title === 'string' &&
					typeof (item as IdeaFeature).expected_signup_increase_pct === 'number'
			)
			.map((item, i) => ({
				id: String(i),
				label: item.title,
				description: typeof (item as IdeaFeature).description === 'string' ? (item as IdeaFeature).description : '',
				signupRate: item.expected_signup_increase_pct
			}));
	}

	const CTA_OPTIONS = ['get notified', 'pre-order', 'sign up now', 'learn more'] as const;

	const id = $derived(page.params.id);

	let features = $state<Feature[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let advertised = $state<AdvertisedFeature[]>([]);
	let customFeatureInput = $state('');
	let cta = $state<string>('get notified');
	let ctaCustom = $state('');
	let showCtaCustom = $state(false);
	let images = $state<File[]>([]);
	let generating = $state(false);
	let generateError = $state<string | null>(null);

	const estimatedSignupRate = $derived(
		advertised.reduce((sum, f) => (f.type === 'ai' ? sum + f.signupRate : sum), 0)
	);

	const availableFeatures = $derived(
		features.filter((f) => !advertised.some((a) => a.type === 'ai' && a.id === f.id))
	);

	function addFeature(f: Feature) {
		advertised = [...advertised, { type: 'ai', ...f }];
	}

	function removeAdvertised(index: number) {
		advertised = advertised.filter((_, i) => i !== index);
	}

	function addCustomFeature() {
		const label = customFeatureInput.trim();
		if (!label) return;
		advertised = [...advertised, { type: 'custom', label }];
		customFeatureInput = '';
	}

	function handleImageChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			images = [...images, ...Array.from(input.files)];
		}
	}

	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
	}

	async function generate() {
		if (!id) return;
		generating = true;
		generateError = null;
		try {
			const imageUrls: string[] = [];
			for (const file of images) {
				const formData = new FormData();
				formData.append('image', file);
				const record = await pb.collection('smoke_images').create<{ image: string }>(formData);
				const url = pb.files.getURL(record, record.image);
				imageUrls.push(url);
			}

			const featuresPayload = advertised.map((f) => ({
				feature: f.label,
				description: f.type === 'ai' ? f.description : '',
				expected_signup_increase_pct: f.type === 'ai' ? f.signupRate : 0
			}));

			const ctaValue = showCtaCustom ? ctaCustom.trim() : cta;
			const backendUrl = getBackendUrl();
			if (!backendUrl) {
				throw new Error('Backend URL is not configured. Set PUBLIC_BACKEND_URL in .env');
			}

			const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/smokes/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
				body: JSON.stringify({
					cta: ctaValue,
					idea_id: id,
					features: featuresPayload,
					images: imageUrls
				})
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Failed to create smoke test: ${res.status} ${text}`);
			}

			const data = (await res.json()) as { id: string };
			if (data.id) {
				goto(`/smokes/${data.id}`);
			} else {
				throw new Error('Invalid response: missing id');
			}
		} catch (e) {
			generateError = e instanceof Error ? e.message : 'Failed to create smoke test';
		} finally {
			generating = false;
		}
	}

	onMount(async () => {
		await checkAuth();
		if (!id) {
			loading = false;
			return;
		}
		try {
			const record = await pb.collection('ideas').getOne<{ features?: unknown }>(id);
			const parsed = parseFeatures(record.features ?? []);
			if (parsed.length === 0) {
				error = 'Pro validation required. Basic validation does not include all analyses needed for smoke tests.';
				loading = false;
				return;
			}
			features = parsed;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load idea';
		} finally {
			loading = false;
		}
	});
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	<a
		href="/idea/{id}"
		class="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-6"
	>
		← Back to idea
	</a>

	<h1 class="text-2xl font-semibold text-white mb-8">Build smoke test</h1>

	{#if loading}
		<p class="text-muted">Loading...</p>
	{:else if error}
		<p class="text-red-400">{error}</p>
	{:else}
	<form class="space-y-8" onsubmit={(e) => { e.preventDefault(); generate(); }}>
		<section class="surface-card p-6 space-y-4">
			<h2 class="text-lg font-medium text-white">Features</h2>
			<p class="text-sm text-muted">
				Click a feature to add it to "will be advertised". Estimated signup rate updates as you select.
			</p>

			<div class="flex items-baseline gap-2">
				<span class="text-sm text-muted">Estimated signup rate:</span>
				<span class="font-medium text-primary">{estimatedSignupRate}%</span>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium text-white">Available features (click to add)</p>
				<div class="flex flex-wrap gap-2">
					{#each availableFeatures as f}
						<div class="inline-flex items-center gap-1 rounded-md border border-neutral-600 bg-neutral-800">
							<button
								type="button"
								onclick={() => addFeature(f)}
								class="px-3 py-1.5 text-sm hover:bg-neutral-700 transition-colors text-left"
							>
								{f.label}
								<span class="ml-1.5 text-primary text-xs">+{f.signupRate}%</span>
							</button>
							{#if f.description}
								<span class="group relative inline-flex px-1.5 py-1 shrink-0 cursor-help" title={f.description}>
									<svg class="size-3.5 text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
									<span class="absolute left-0 bottom-full mb-1 z-10 w-64 max-w-[min(320px,90vw)] rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-xs text-zinc-200 shadow-xl whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none">
										{f.description}
									</span>
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium text-white">Will be advertised</p>
				{#if advertised.length === 0}
					<p class="text-sm text-muted">No features selected yet</p>
				{:else}
					<ul class="space-y-2">
						{#each advertised as item, i}
							<li class="flex items-center gap-2">
								<span class="text-sm flex items-center gap-1">
									{item.label}
									{#if item.type === 'ai'}
										<span class="text-primary">+{item.signupRate}%</span>
										{#if item.description}
											<span class="group relative inline-flex shrink-0 cursor-help" title={item.description}>
												<svg class="size-3.5 text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
												<span class="absolute left-0 bottom-full mb-1 z-10 w-64 max-w-[min(320px,90vw)] rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-xs text-zinc-200 shadow-xl whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none">
													{item.description}
												</span>
											</span>
										{/if}
									{:else}
										<span class="text-muted" title="Custom feature – no estimated impact">?</span>
									{/if}
								</span>
								<button
									type="button"
									onclick={() => removeAdvertised(i)}
									class="text-muted hover:text-white text-xs"
								>
									Remove
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="flex gap-2">
				<input
					type="text"
					bind:value={customFeatureInput}
					placeholder="Add your own feature..."
					class="flex-1 px-3 py-2 rounded-md border border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
					onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
				/>
				<button
					type="button"
					onclick={addCustomFeature}
					class="btn btn-md btn-secondary"
				>
					Add
				</button>
			</div>
			<p class="text-xs text-muted">Custom features won't affect estimated signup rate</p>
		</section>

		<section class="surface-card p-6 space-y-4">
			<h2 class="text-lg font-medium text-white">CTA</h2>
			<div class="flex flex-wrap gap-2">
				{#each CTA_OPTIONS as opt}
					<button
						type="button"
						onclick={() => { cta = opt; showCtaCustom = false; }}
						class="px-3 py-1.5 rounded-md border text-sm transition-colors {cta === opt && !showCtaCustom
							? 'border-primary bg-primary/20 text-primary'
							: 'border-neutral-600 bg-neutral-800 hover:bg-neutral-700'}"
					>
						{opt}
					</button>
				{/each}
				<button
					type="button"
					onclick={() => { showCtaCustom = true; cta = ''; }}
					class="px-3 py-1.5 rounded-md border border-neutral-600 bg-neutral-800 text-sm hover:bg-neutral-700 transition-colors"
				>
					Other...
				</button>
			</div>
			{#if showCtaCustom}
				<div class="pt-2">
					<input
						type="text"
						bind:value={ctaCustom}
						placeholder="Enter your CTA"
						class="w-full max-w-xs px-3 py-2 rounded-md border border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
			{/if}
		</section>

		<section class="surface-card p-6 space-y-4">
			<h2 class="text-lg font-medium text-white">Images</h2>
			<p class="text-sm text-muted">Include mockup/photo of your product if you have it</p>
			<input
				type="file"
				accept="image/*"
				multiple
				onchange={handleImageChange}
				class="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-neutral-700 file:text-white file:cursor-pointer hover:file:bg-neutral-600"
			/>
			{#if images.length > 0}
				<ul class="flex flex-wrap gap-2">
					{#each images as img, i}
						<li class="flex items-center gap-2 text-sm">
							<span class="text-muted truncate max-w-[120px]">{img.name}</span>
							<button type="button" onclick={() => removeImage(i)} class="text-muted hover:text-white">
								×
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		{#if generateError}
			<p class="text-red-400 text-sm">{generateError}</p>
		{/if}

		<button
			type="submit"
			disabled={generating}
			class="btn btn-lg btn-primary w-full"
		>
			{#if generating}
				<span class="inline-flex items-center gap-2">
					<svg class="size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Generating...
				</span>
			{:else}
				Generate
			{/if}
		</button>
	</form>
	{/if}
</div>
