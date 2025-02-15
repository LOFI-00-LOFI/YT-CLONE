<script lang="ts">
  import type { YouTubeVideo } from '$lib/services/youtube';
  import { goto } from '$app/navigation';
  import { fetchChannel } from '$lib/services/youtube';
  import { formatTimeAgo, formatNumber, formatDuration } from '$lib/utils/format';
  
  let { video } = $props<{ video: YouTubeVideo }>();
  let { compact = false } = $props<{ compact?: boolean }>();
  
  let channelData = $state(null);

  $effect(() => {
    fetchChannel(video.snippet.channelId).then(data => {
      channelData = data;
    });
  });

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

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) {
      return `${Math.floor(days / 365)} years ago`;
    }
    if (days > 30) {
      return `${Math.floor(days / 30)} months ago`;
    }
    if (days > 0) {
      return `${days} days ago`;
    }
    return 'Today';
  }

  function handleClick() {
    goto(`/watch?v=${video.id}`);
  }
</script>

<div 
  class="flex {compact ? 'flex-row gap-2' : 'flex-col gap-2'} cursor-pointer w-full" 
  on:click={handleClick}
>
  <div class="relative {compact ? 'w-40' : 'w-full'} aspect-video rounded-xl overflow-hidden group">
    <img
      src={video.snippet.thumbnails.high.url}
      class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
      alt={video.snippet.title}
      loading="lazy"
    />
    {#if video.contentDetails?.duration}
      <div class="absolute bottom-1 right-1 bg-black bg-opacity-80 px-1 text-xs rounded">
        {formatDuration(video.contentDetails.duration)}
      </div>
    {/if}
  </div>
  
  <div class="flex gap-3 {compact ? 'flex-1' : ''} px-1">
    {#if !compact}
      <div class="flex-shrink-0">
        <button 
          class="w-9 h-9 rounded-full overflow-hidden"
          on:click|stopPropagation={() => goto(`/channel/${video.snippet.channelId}`)}
        >
          <img
            class="w-full h-full object-cover"
            src={channelData?.snippet?.thumbnails?.default?.url || '/default-avatar.png'}
            alt={video.snippet.channelTitle}
            loading="lazy"
          />
        </button>
      </div>
    {/if}
    <div class="flex flex-col flex-1 min-w-0">
      <h3 class="font-medium line-clamp-2 leading-5">
        {video.snippet.title}
      </h3>
      <button 
        class="text-sm text-gray-400 hover:text-white mt-1 text-left"
        on:click|stopPropagation={() => goto(`/channel/${video.snippet.channelId}`)}
      >
        {video.snippet.channelTitle}
      </button>
      <div class="text-sm text-gray-400">
        {formatNumber(video.statistics.viewCount)} views • {formatTimeAgo(video.snippet.publishedAt)}
      </div>
    </div>
  </div>
</div> 