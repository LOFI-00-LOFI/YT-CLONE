<script lang="ts">
	import { currentCategory } from '$lib/stores/category';
	let scrollContainer: HTMLDivElement;

	const categories = [
		{ id: 'home', label: 'All' },
		{ id: 'music', label: 'Music' },
		{ id: 'gaming', label: 'Gaming' },
		{ id: 'news', label: 'News' },
		{ id: 'sports', label: 'Sports' },
		{ id: 'trending', label: 'Trending' },
		{ id: 'learning', label: 'Learning' },
		{ id: 'fashion', label: 'Fashion & Beauty' }
	];

	// Use the store value
	$: selectedCategory = $currentCategory;

	function selectCategory(categoryId: string) {
		currentCategory.set(categoryId);
	}

	function scroll(direction: 'left' | 'right') {
		if (scrollContainer) {
			const scrollAmount = 200;
			scrollContainer.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}
	}
</script>

<div class="sticky top-[0] z-10 bg-bg-primary">
	<div class="relative flex items-center">
		<!-- Left scroll button -->
		<button
			class="absolute left-0 z-10 p-2 bg-gradient-to-r from-bg-primary to-transparent"
			onclick={() => scroll('left')}
		>
			<svg class="w-6 h-6 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		<!-- Categories -->
		<div
			bind:this={scrollContainer}
			class="flex gap-3 overflow-x-auto py-2 px-8 no-scrollbar scroll-smooth touch-pan-x"
		>
			{#each categories as { id, label }}
				<button
					class="px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium transition-colors flex-shrink-0"
					class:bg-text-primary={selectedCategory === id}
					class:text-bg-primary={selectedCategory === id}
					class:bg-bg-secondary={selectedCategory !== id}
					class:text-text-primary={selectedCategory !== id}
					onclick={() => selectCategory(id)}
				>
					{label}
				</button>
			{/each}
		</div>

		<!-- Right scroll button -->
		<button
			class="absolute right-0 z-10 p-2 bg-gradient-to-l from-bg-primary to-transparent"
			onclick={() => scroll('right')}
		>
			<svg class="w-6 h-6 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	</div>
</div>

<style>
	/* Hide scrollbar but keep functionality */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
