<script lang="ts">
	import { currentCategory } from '$lib/stores/category';
	import { fetchVideos, type YouTubeVideo } from '$lib';
	import VideoCard from './VideoCard.svelte';

	let { sidebarOpen = false } = $props<{
		sidebarOpen?: boolean;
	}>();

	let videos = $state<YouTubeVideo[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	
	// Use a non-reactive variable to prevent reactivity loops
	let lastLoadedCategory: string | null = null;
	// Flag to prevent duplicate loads
	let isLoadingData = false;

	async function loadVideos(category: string) {
		// Skip if already loading this category or already in the process of loading
		if (category === lastLoadedCategory || isLoadingData) return;
		
		loading = true;
		isLoadingData = true;
		error = null;
		
		const data = await fetchVideos(fetch, { category });
		videos = data.videos;
		lastLoadedCategory = category;
		
		loading = false;
		isLoadingData = false;
	}

	// Load videos when category changes
	$effect(() => {
		const category = $currentCategory;
		if (category && category !== lastLoadedCategory && !isLoadingData) {
			loadVideos(category);
		}
	});
</script>

{#if loading}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
		{#each Array(12) as _}
			<div class="flex flex-col gap-2 animate-pulse">
				<div class="aspect-video bg-hover-bg rounded-xl"></div>
				<div class="flex gap-2">
					<div class="w-10 h-10 rounded-full bg-hover-bg"></div>
					<div class="flex-1 space-y-2">
						<div class="h-4 bg-hover-bg rounded w-3/4"></div>
						<div class="h-3 bg-hover-bg rounded w-1/2"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else if error}
	<div class="text-red-500 p-4 text-center">{error}</div>
{:else}
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
		{#each videos as video}
			<VideoCard {video} />
		{/each}
	</div>
{/if}
