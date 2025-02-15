<script lang="ts">
  import type { YouTubeVideo } from '$lib/services/youtube';
  import { ThumbsUp, ThumbsDown, Share, Download, MoreVertical } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { fetchChannel } from '$lib/services/youtube';
  import { formatTimeAgo, formatNumber } from '$lib/utils/format';
  
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
</script>

<div class="flex flex-col gap-4">
  <!-- Title -->
  <h1 class="text-lg sm:text-xl font-medium break-words">
    {video.snippet.title}
  </h1>

  <div class="flex flex-col gap-4">
    <!-- Channel Info -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={channelData?.snippet?.thumbnails?.default?.url || '/default-avatar.png'}
            alt={video.snippet.channelTitle}
            class="w-full h-full object-cover"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-medium truncate">{video.snippet.channelTitle}</h3>
          <span class="text-sm text-gray-400">
            {channelData ? formatNumber(channelData.statistics.subscriberCount) : '0'} subscribers
          </span>
        </div>
      </div>
      <button class="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 flex-shrink-0">
        Subscribe
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex bg-yt-dark rounded-full">
        <button class="flex items-center gap-2 px-4 py-2 hover:bg-yt-secondary rounded-l-full">
          <ThumbsUp size={20} />
          <span>{formatNumber(video.statistics.likeCount)}</span>
        </button>
        <button class="px-4 py-2 hover:bg-yt-secondary rounded-r-full border-l border-yt-secondary">
          <ThumbsDown size={20} />
        </button>
      </div>
      
      <button class="flex items-center gap-2 px-4 py-2 bg-yt-dark hover:bg-yt-secondary rounded-full">
        <Share size={20} />
        <span>Share</span>
      </button>
      
      <button class="flex items-center gap-2 px-4 py-2 bg-yt-dark hover:bg-yt-secondary rounded-full">
        <Download size={20} />
        <span>Download</span>
      </button>
      
      <button class="p-2 hover:bg-yt-secondary rounded-full">
        <MoreVertical size={20} />
      </button>
    </div>
  </div>

  <!-- Description Section -->
  <div class="mt-2 bg-yt-dark rounded-xl p-3 break-words">
    <div class="flex items-center gap-2 text-sm text-gray-400">
      {formatNumber(video.statistics.viewCount)} views • {formatTimeAgo(video.snippet.publishedAt)}
    </div>
    
    <div class="text-sm whitespace-pre-line">
      {#if showFullDescription || video.snippet.description.length <= 200}
        {video.snippet.description}
      {:else}
        {video.snippet.description.slice(0, 200)}...
        <button 
          class="text-gray-400 hover:text-white font-medium ml-1"
          on:click={() => showFullDescription = true}
        >
          Show more
        </button>
      {/if}
    </div>
  </div>
</div> 