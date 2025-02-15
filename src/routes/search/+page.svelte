<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { searchVideos, fetchChannel, type YouTubeVideo } from '$lib/services/youtube';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { Filter } from 'lucide-svelte';
  import { formatTimeAgo, formatNumber, formatDuration } from '$lib/utils/format';

  let videos: YouTubeVideo[] = [];
  let loading = true;
  let error: string | null = null;
  let nextPageToken: string | undefined;
  let searchQuery = $page.url.searchParams.get('q') || '';
  let channelDataMap: Record<string, any> = {};

  const filters = [
    "All", "Videos", "Shorts", "Playlists", "Channels", "People", "Movies", "Live"
  ];

  let selectedFilter = "All";

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

  async function loadSearchResults(query: string, token?: string) {
    if (!query) return;

    try {
      loading = true;
      error = null;
      const data = await searchVideos(query, token);
      
      // Fetch channel data for each video
      const channelPromises = data.videos.map(video => 
        fetchChannel(video.snippet.channelId)
          .then(channelData => {
            channelDataMap[video.snippet.channelId] = channelData;
          })
      );
      
      await Promise.all(channelPromises);
      
      if (token) {
        videos = [...videos, ...data.videos];
      } else {
        videos = data.videos;
      }
      nextPageToken = data.nextPageToken;
    } catch (e) {
      error = 'Failed to load search results';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (!nextPageToken || loading) return;
    await loadSearchResults(searchQuery, nextPageToken);
  }

  // Watch for URL changes
  $: if ($page.url.searchParams.get('q') !== searchQuery) {
    searchQuery = $page.url.searchParams.get('q') || '';
    if (searchQuery) {
      loadSearchResults(searchQuery);
    }
  }

  onMount(() => {
    if (searchQuery) {
      loadSearchResults(searchQuery);
    } else {
      loading = false;
    }
  });
</script>

<!-- Filters bar -->
<div class="sticky top-[-20px] bg-yt-black z-10">
  <div class="flex items-center gap-3 px-4 md:px-8 lg:px-28 h-14">
    <button class="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-yt-dark">
      <Filter size={20} />
      <span class="text-sm">Filters</span>
    </button>

    <div class="flex gap-3 overflow-x-auto no-scrollbar">
      {#each filters as filter}
        <button 
          class="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
          class:bg-white={selectedFilter === filter}
          class:text-black={selectedFilter === filter}
          class:bg-yt-dark={selectedFilter !== filter}
          on:click={() => selectedFilter = filter}
        >
          {filter}
        </button>
      {/each}
    </div>
  </div>
</div>

<!-- Search Results -->
<div class="px-4 md:px-8 lg:px-28">
  {#if loading && videos.length === 0}
    <div class="space-y-6 py-6">
      {#each Array(5) as _}
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-pulse">
          <div class="w-full sm:w-[360px] aspect-video bg-yt-dark rounded-xl"></div>
          <div class="flex-1 py-1 space-y-3">
            <div class="h-5 bg-yt-dark rounded w-2/3"></div>
            <div class="h-4 bg-yt-dark rounded w-1/4"></div>
            <div class="h-4 bg-yt-dark rounded w-1/2"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="text-red-500 p-4 text-center">{error}</div>
  {:else if videos.length === 0 && !loading}
    <div class="text-center py-8">
      <p class="text-lg">No results found for "{searchQuery}"</p>
      <p class="text-gray-400 mt-2">Try different keywords or remove search filters</p>
    </div>
  {:else}
    <div class="flex flex-col gap-6 sm:gap-8 py-6">
      {#each videos as video}
        <div 
          class="flex flex-col sm:flex-row gap-4 sm:gap-6 group cursor-pointer" 
          on:click={() => goto(`/watch?v=${video.id}`)}
        >
          <!-- Thumbnail -->
          <div class="relative w-full sm:w-[360px] aspect-video rounded-xl overflow-hidden">
            <img
              src={video.snippet.thumbnails.high.url}
              alt={video.snippet.title}
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
            />
            {#if video.contentDetails?.duration}
              <div class="absolute bottom-1 right-1 bg-black bg-opacity-80 px-1 text-xs rounded">
                {formatDuration(video.contentDetails.duration)}
              </div>
            {/if}
          </div>
          
          <!-- Info -->
          <div class="flex-1">
            <h3 class="font-medium text-base sm:text-lg line-clamp-2 group-hover:text-blue-400">
              {video.snippet.title}
            </h3>
            <div class="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <span>{formatNumber(video.statistics.viewCount)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.snippet.publishedAt)}</span>
            </div>
            <div class="flex items-center gap-2 mt-2 sm:mt-3">
              <img
                src={channelDataMap[video.snippet.channelId]?.snippet?.thumbnails?.default?.url || '/default-avatar.png'}
                alt={video.snippet.channelTitle}
                class="w-6 h-6 rounded-full"
              />
              <span class="text-xs text-gray-400 hover:text-white">
                {video.snippet.channelTitle}
              </span>
            </div>
            <p class="hidden sm:block text-xs text-gray-400 mt-3 line-clamp-2">
              {video.snippet.description.slice(0, 150)}...
            </p>
          </div>
        </div>
      {/each}
    </div>

    {#if loading}
      <div class="flex justify-center p-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    {:else if nextPageToken}
      <div class="flex justify-center p-4">
        <button
          class="bg-yt-dark px-4 py-2 rounded-lg hover:bg-yt-secondary"
          on:click={loadMore}
        >
          Load More
        </button>
      </div>
    {/if}
  {/if}
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