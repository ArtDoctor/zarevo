<script lang="ts">
	import Skeleton from './ui/Skeleton.svelte';
</script>

<div class="flex flex-col gap-6">
	<section>
		<Skeleton class="h-6 w-32 mb-2" />
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-[80%]" />
		</div>
	</section>
	<section>
		<Skeleton class="h-6 w-40 mb-2" />
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-[75%]" />
		</div>
	</section>
	<section>
		<Skeleton class="h-6 w-36 mb-2" />
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-[83%]" />
		</div>
	</section>
	<section>
		<Skeleton class="h-6 w-28 mb-2" />
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-2/3" />
		</div>
	</section>
	<div class="grid grid-cols-2 gap-6 mt-2">
		<section>
			<Skeleton class="h-6 w-24 mb-2" />
			<div class="flex flex-col gap-2">
				<Skeleton class="h-4 w-full" />
				<Skeleton class="h-4 w-[80%]" />
			</div>
		</section>
		<section>
			<Skeleton class="h-6 w-20 mb-2" />
			<div class="flex flex-col gap-2">
				<Skeleton class="h-4 w-full" />
				<Skeleton class="h-4 w-3/4" />
			</div>
		</section>
	</div>
</div>
