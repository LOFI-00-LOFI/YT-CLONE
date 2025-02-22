<script lang="ts">
  import type { YouTubeVideo } from '$lib/services/youtube';
  import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { fetchChannel } from '$lib/services/youtube';
  import { formatTimeAgo, formatNumber } from '$lib/utils/format';
  import { goto } from '$app/navigation';
  
  export let video: YouTubeVideo;
  let showFullDescription = false;
  let channelData: any = null;

  onMount(async () => {
    channelData = await fetchChannel(video.snippet.channelId);
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function handleChannelClick() {
    goto(`/channel/${video.snippet.channelId}`);
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Title -->
  <h1 class="text-lg sm:text-xl font-semibold text-text-primary">
    {video.snippet.title}
  </h1>

  <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
    <div class="flex items-center gap-3">
      <button 
        class="flex-shrink-0"
        onclick={handleChannelClick}
      >
        <img
          src={video.channelThumbnail || '/default-avatar.png'}
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
          {formatNumber(video.statistics.subscriberCount || 0)} subscribers
        </span>
      </div>

      <button class="ml-4 bg-text-primary text-bg-primary px-4 py-2 rounded-full text-sm font-medium hover:opacity-90">
        Subscribe
      </button>
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

      <button class="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-hover-bg rounded-full">
        <Share size={20} class="text-text-primary" />
        <span class="text-text-primary text-sm font-medium">Share</span>
      </button>

      <button class="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-hover-bg rounded-full">
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
      {#if showFullDescription || video.snippet.description.length <= 200}
        {video.snippet.description}
      {:else}
        {video.snippet.description.slice(0, 200)}...
        <button 
          class="text-gray-400 hover:text-white font-medium ml-1"
          onclick={() => showFullDescription = true}
        >
          Show more
        </button>
      {/if}
    </div>
  </div>
</div> 