<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchRelatedVideos, type YouTubeVideo } from '$lib';
	import { formatTimeAgo, formatNumber } from '$lib/utils/format';
	import { goto } from '$app/navigation';

	export let currentVideoId: string | null;

	let videos: YouTubeVideo[] = [];
	let loading = true;
	let error: string | null = null;
	let retryCount = 0;
	const MAX_RETRIES = 2;

	async function loadRelatedVideos(videoId: string | null) {
		if (!videoId) return;
		try {
			loading = true;
			error = null;
			console.log('Fetching related videos for:', videoId);
			const data = await fetchRelatedVideos(videoId, fetch);
			videos = data.videos;
			console.log('Related videos loaded:', videos.length);

			if (videos.length === 0) {
				error = 'No related videos found';
			}
		} catch (e) {
			console.error('Error loading related videos:', e);

			if (retryCount < MAX_RETRIES) {
				retryCount++;
				console.log(`Retrying (${retryCount}/${MAX_RETRIES})...`);
				setTimeout(() => {
					loadRelatedVideos(videoId);
				}, 1000); // Wait a second before retrying
			} else {
				error = 'Failed to load related videos';
			}
		} finally {
			loading = false;
		}
	}

	function handleVideoClick(videoId: string) {
		goto(`/watch?v=${videoId}`);
	}

	// Reset retry count when video changes
	$: if (currentVideoId) {
		retryCount = 0;
		loadRelatedVideos(currentVideoId);
	}

	onMount(() => {
		if (currentVideoId) {
			loadRelatedVideos(currentVideoId);
		}
	});
</script>

{#if loading}
	<div class="space-y-4">
		{#each Array(5) as _}
			<div class="flex gap-2 animate-pulse">
				<div class="w-40 aspect-video bg-hover-bg rounded-xl"></div>
				<div class="flex-1 space-y-2">
					<div class="h-4 bg-hover-bg rounded w-3/4"></div>
					<div class="h-3 bg-hover-bg rounded w-1/2"></div>
					<div class="h-3 bg-hover-bg rounded w-1/4"></div>
				</div>
			</div>
		{/each}
	</div>
{:else if error}
	<div class="text-red-500 text-center p-4">
		{error}
		<button
			class="mt-2 text-sm underline"
			on:click={() => {
				retryCount = 0;
				loadRelatedVideos(currentVideoId);
			}}
		>
			Try again
		</button>
	</div>
{:else if videos.length === 0}
	<div class="text-center text-text-secondary py-4">No related videos found</div>
{:else}
	<div class="flex flex-col gap-3">
		{#each videos as video (video.id)}
			<div
				role="presentation"
				class="flex gap-2 hover:bg-hover-bg p-2 rounded-xl transition-colors cursor-pointer"
				on:click={() => handleVideoClick(video.id)}
			>
				<!-- Thumbnail -->
				<div class="relative w-40 flex-shrink-0">
					<img
						src={video.snippet.thumbnails.medium.url}
						alt={video.snippet.title}
						class="w-full aspect-video object-cover rounded-xl"
					/>
					{#if video.contentDetails?.duration}
						<div class="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-xs text-white">
							{video.contentDetails.duration}
						</div>
					{/if}
				</div>

				<!-- Video Info -->
				<div class="flex flex-col flex-1 min-w-0">
					<h3 class="font-medium text-sm text-text-primary line-clamp-2 text-left">
						{video.snippet.title}
					</h3>
					<p class="text-xs text-text-secondary mt-1">
						{video.snippet.channelTitle}
					</p>
					<div class="flex items-center text-xs text-text-secondary mt-1">
						<span>{formatNumber(video.statistics.viewCount)} views</span>
						<span class="mx-1">•</span>
						<span>{formatTimeAgo(video.snippet.publishedAt)}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

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
