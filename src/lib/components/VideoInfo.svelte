<script lang="ts">
	import type { YouTubeVideo, YouTubeChannel } from '$lib';
	import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal } from 'lucide-svelte';
	import { fetchChannel } from '$lib';
	import { formatTimeAgo, formatNumber } from '$lib/utils/format';
	import { goto } from '$app/navigation';

	let { video } = $props<{
		video?: YouTubeVideo;
	}>();

	let channel = $state<YouTubeChannel | null>(null);
	let isExpanded = $state(false);
	
	// Use a non-reactive variable to prevent infinite loops
	let lastLoadedChannelId: string | null = null;

	$effect(() => {
		if (video && 
            video.snippet.channelId && 
            video.snippet.channelId !== lastLoadedChannelId) {
            
			// Set the non-reactive tracking variable first to prevent loops
			const channelId = video.snippet.channelId;
			lastLoadedChannelId = channelId;
			
			fetchChannel(channelId, fetch).then((data) => {
				channel = data;
			});
		}
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function handleChannelClick() {
		if (video) {
			goto(`/channel/${video.snippet.channelId}`);
		}
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

{#if video}
	<div class="flex flex-col gap-4">
		<!-- Title -->
		<h1 class="text-lg sm:text-xl font-semibold text-text-primary">
			{video.snippet.title}
		</h1>

		<div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
			<div class="flex items-center gap-3 justify-between">
				<div class="flex items-center gap-2">
					<button class="flex-shrink-0" onclick={handleChannelClick}>
						<img
							src={channel?.snippet?.thumbnails?.default?.url || '/default-avatar.png'}
							alt={video.snippet.channelTitle}
							class="w-10 h-10 rounded-full"
						/>
					</button>

					<div class="flex flex-col">
						<button
							class="font-medium text-text-primary hover:text-text-secondary text-left"
							onclick={handleChannelClick}
						>
							{video.snippet.channelTitle}
						</button>
						<span class="text-sm text-text-secondary">
							{formatNumber(channel?.statistics?.subscriberCount || 0)} subscribers
						</span>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<button
						class="ml-4 bg-text-primary text-bg-primary px-4 py-2 rounded-full text-sm font-medium hover:opacity-90"
					>
						Subscribe
					</button>
				</div>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				<div class="flex bg-bg-secondary rounded-full overflow-hidden">
					<button class="flex items-center gap-2 px-4 py-2 hover:bg-hover-bg">
						<ThumbsUp size={20} class="text-text-primary" />
						<span class="text-text-primary text-sm font-medium">
							{formatNumber(video.statistics.likeCount || 0)}
						</span>
					</button>
					<div class="w-[1px] bg-border-color"></div>
					<button class="flex items-center px-4 py-2 hover:bg-hover-bg">
						<ThumbsDown size={20} class="text-text-primary" />
					</button>
				</div>

				<button
					class="hidden items-center gap-2 px-4 py-2 bg-bg-secondary lg:flex hover:bg-hover-bg rounded-full"
				>
					<Share size={20} class="text-text-primary" />
					<span class="text-text-primary text-sm font-medium">Share</span>
				</button>

				<button
					class="flex items-center gap-2 px-4 py-2 bg-bg-secondary lg:flex hover:bg-hover-bg rounded-full"
				>
					<Download size={20} class="text-text-primary" />
					<span class="text-text-primary text-sm font-medium">Download</span>
				</button>

				<button class="p-2 bg-bg-secondary hover:bg-hover-bg rounded-full">
					<MoreHorizontal size={20} class="text-text-primary" />
				</button>
			</div>
		</div>

		<!-- Description Section -->
		<div class="bg-bg-secondary rounded-xl p-3 mt-2">
			<div class="flex gap-2 text-sm text-text-primary font-medium">
				<span>{formatNumber(video.statistics.viewCount)} views</span>
				<span>•</span>
				<span>{formatTimeAgo(video.snippet.publishedAt)}</span>
			</div>

			<div class="text-sm whitespace-pre-line">
				{#if isExpanded || video.snippet.description.length <= 200}
					{video.snippet.description}
				{:else}
					{video.snippet.description.slice(0, 200)}...
					<button class="font-medium ml-1" onclick={toggleExpanded}> Show more </button>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-col gap-4 animate-pulse">
		<div class="h-6 bg-hover-bg rounded w-3/4"></div>
		<div class="flex justify-between">
			<div class="flex items-center gap-2">
				<div class="w-10 h-10 bg-hover-bg rounded-full"></div>
				<div>
					<div class="h-4 bg-hover-bg rounded w-32 mb-1"></div>
					<div class="h-3 bg-hover-bg rounded w-24"></div>
				</div>
			</div>
			<div class="flex gap-2">
				<div class="h-8 bg-hover-bg rounded-full w-24"></div>
				<div class="h-8 bg-hover-bg rounded-full w-24"></div>
			</div>
		</div>
		<div class="h-32 bg-hover-bg rounded-xl"></div>
	</div>
{/if}
