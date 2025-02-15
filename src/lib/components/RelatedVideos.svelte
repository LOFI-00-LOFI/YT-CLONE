<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchRelatedVideos, type YouTubeVideo } from '$lib/services/youtube';
  import VideoCard from './VideoCard.svelte';
  import { goto } from '$app/navigation';
  import { formatTimeAgo, formatNumber, formatDuration } from '$lib/utils/format';
  
  export let currentVideoId: string | null;
  
  let videos: YouTubeVideo[] = [];
  let loading = true;
  let error: string | null = null;

  function formatViews(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return viewCount;
  }

  async function loadRelatedVideos(videoId: string | null) {
    if (!videoId) return;
    
    try {
      loading = true;
      error = null;
      const data = await fetchRelatedVideos(videoId);
      videos = data.videos;
    } catch (e) {
      error = 'Failed to load related videos';
    } finally {
      loading = false;
    }
  }

  // Watch for video ID changes
  $: if (currentVideoId) {
    loadRelatedVideos(currentVideoId);
  }

  onMount(() => {
    loadRelatedVideos(currentVideoId);
  });
</script>

{#if loading}
  <div class="space-y-4">
    {#each Array(5) as _}
      <div class="flex gap-2 animate-pulse">
        <div class="w-40 aspect-video bg-yt-dark rounded-xl"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-yt-dark rounded w-3/4"></div>
          <div class="h-3 bg-yt-dark rounded w-1/2"></div>
          <div class="h-3 bg-yt-dark rounded w-1/4"></div>
        </div>
      </div>
    {/each}
  </div>
{:else if error}
  <div class="text-red-500 text-center p-4">{error}</div>
{:else}
  <div class="flex flex-col gap-3">
    {#each videos as video}
      <div 
        class="flex gap-2 cursor-pointer hover:bg-yt-dark rounded-xl p-1"
        on:click={() => goto(`/watch?v=${video.id}`)}
      >
        <!-- Thumbnail -->
        <div class="relative w-40 flex-shrink-0">
          <img
            src={video.snippet.thumbnails.medium.url}
            alt={video.snippet.title}
            class="w-full aspect-video object-cover rounded-xl"
            loading="lazy"
          />
          {#if video.contentDetails?.duration}
            <div class="absolute bottom-1 right-1 bg-black bg-opacity-80 px-1 text-xs rounded">
              {formatDuration(video.contentDetails.duration)}
            </div>
          {/if}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-sm line-clamp-2">
            {video.snippet.title}
          </h3>
          <a 
            href={`/channel/${video.snippet.channelId}`}
            class="text-xs text-gray-400 hover:text-white mt-1 block"
            on:click|stopPropagation
          >
            {video.snippet.channelTitle}
          </a>
          <div class="text-xs text-gray-400">
            {formatNumber(video.statistics.viewCount)} views • {formatTimeAgo(video.snippet.publishedAt)}
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