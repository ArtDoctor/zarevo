<script lang="ts">
	let mainInput = $state('');
	let targetMarket = $state('');
	let problem = $state('');
	let solution = $state('');
	let competitors = $state('');
</script>

<div class="max-w-2xl mx-auto py-12 px-4">
	<a
		href="/home"
		class="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 mb-6"
	>
		← Back to home
	</a>
	<h1 class="text-2xl font-semibold text-zinc-800 dark:text-zinc-200 mb-8">Advanced Validation</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
		}}
		class="space-y-6"
	>
		<div>
			<label for="main" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Startup idea
			</label>
			<textarea
				id="main"
				bind:value={mainInput}
				placeholder="Describe your startup idea..."
				class="w-full h-24 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
				rows="4"
			></textarea>
		</div>

		<div>
			<label for="market" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Target market
			</label>
			<input
				id="market"
				type="text"
				bind:value={targetMarket}
				placeholder="Who are your customers?"
				class="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="problem" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Problem
			</label>
			<textarea
				id="problem"
				bind:value={problem}
				placeholder="What problem does it solve?"
				class="w-full h-20 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
				rows="3"
			></textarea>
		</div>

		<div>
			<label for="solution" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Solution
			</label>
			<textarea
				id="solution"
				bind:value={solution}
				placeholder="How does your product solve it?"
				class="w-full h-20 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
				rows="3"
			></textarea>
		</div>

		<div>
			<label for="competitors" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
				Competitors
			</label>
			<input
				id="competitors"
				type="text"
				bind:value={competitors}
				placeholder="Who else is in this space?"
				class="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
			/>
		</div>

		<button
			type="submit"
			class="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg transition-colors"
		>
			Validate
		</button>
	</form>
</div>
