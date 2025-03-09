<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { currentCategory } from '$lib/stores/category';
	import { fetchVideos, type YouTubeVideo } from '$lib';
	import VideoCard from './VideoCard.svelte';

	export let sidebarOpen = false;

	let videos: YouTubeVideo[] = [];
	let loading = true;
	let error: string | null = null;

	async function loadVideos(category: string) {
		try {
			loading = true;
			error = null;
			const data = await fetchVideos(fetch, { category });
			videos = data.videos;
		} catch (e) {
			error = 'Failed to load videos';
			console.error('Error loading videos:', e);
		} finally {
			loading = false;
		}
	}

	// Subscribe to category changes
	$: {
		if ($currentCategory) {
			loadVideos($currentCategory);
		}
	}

	onMount(() => {
		loadVideos($currentCategory);
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
