<script lang="ts">
	import type { YouTubeVideo, YouTubeChannel } from '$lib';
	import { goto } from '$app/navigation';
	import { fetchChannel } from '$lib';
	import { formatTimeAgo, formatNumber, formatDuration } from '$lib/utils/format';

	let {
		video,
		compact = false,
		thumbnailClass = ''
	} = $props<{
		video: YouTubeVideo;
		compact?: boolean;
		thumbnailClass?: string;
	}>();
	let channelData = $state<YouTubeChannel | null>(null);
	
	// Use a non-reactive variable to prevent infinite loops
	let lastLoadedChannelId: string | null = null;

	$effect(() => {
		const channelId = video.snippet.channelId;
		if (channelId && channelId !== lastLoadedChannelId) {
			// Set this before the async operation to avoid multiple fetches
			lastLoadedChannelId = channelId;
			fetchChannel(channelId, fetch).then((data) => {
				if (data) {
					channelData = data;
				}
			});
		}
	});

	function handleClick() {
		goto(`/watch?v=${video.id}`);
	}

	function handleChannelClick(e: Event) {
		e.stopPropagation();
		goto(`/channel/${video.snippet.channelId}`);
	}
</script>

<div
	class="flex {compact
		? 'flex-col md:flex-row gap-4'
		: 'flex-col gap-2'} cursor-pointer w-full group"
	onclick={handleClick}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
>
	<div
		class="relative {thumbnailClass ||
			(compact ? 'w-full md:w-[360px]' : 'w-full')} aspect-video rounded-xl overflow-hidden"
	>
		<img
			src={video.snippet.thumbnails.high.url}
			class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
			alt={video.snippet.title}
		/>
		{#if video.contentDetails?.duration}
			<div class="absolute bottom-1 right-1 bg-black/80 text-white px-1 text-xs rounded">
				{formatDuration(video.contentDetails.duration)}
			</div>
		{/if}
	</div>

	<div class="flex gap-3 {compact ? 'flex-1' : ''} px-1">
		{#if !compact}
			<div class="flex-shrink-0">
				<button class="w-9 h-9 rounded-full overflow-hidden" onclick={handleChannelClick}>
					<img
						class="w-full h-full object-cover"
						src={channelData?.snippet?.thumbnails?.default?.url || '/default-avatar.png'}
						alt={video.snippet.channelTitle}
					/>
				</button>
			</div>
		{/if}
		<div class="flex flex-col flex-1 min-w-0">
			<h3 class="font-medium line-clamp-2 leading-5 text-text-primary">
				{video.snippet.title}
			</h3>
			<button
				class="text-sm text-text-secondary hover:text-text-primary mt-1 text-left"
				onclick={handleChannelClick}
			>
				{video.snippet.channelTitle}
			</button>
			<div class="text-sm text-text-secondary">
				{formatNumber(video.statistics.viewCount)} views • {formatTimeAgo(
					video.snippet.publishedAt
				)}
			</div>
		</div>
	</div>
</div>
