<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { searchVideos, fetchChannel, type YouTubeVideo } from '$lib';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
  import { fade } from 'svelte/transition';
  import { sidebarOpen } from '$lib/stores/ui';

  interface SearchState {
    videos: YouTubeVideo[];
    loading: boolean;
    error: string | null;
    nextPageToken?: string;
    searchQuery: string;
    channelDataMap: Record<string, any>;
    hasMore: boolean;
    initialLoad: boolean;
  }

  let state = $state<SearchState>({
    videos: [],
    loading: false,
    error: null,
    nextPageToken: undefined,
    searchQuery: $page.url.searchParams.get('q') || '',
    channelDataMap: {},
    hasMore: true,
    initialLoad: true
  });

  async function loadMore() {
    if (state.loading || !state.hasMore || !state.searchQuery) return;
    
    state.loading = true;
    state.error = null;
    
    const data = await searchVideos(state.searchQuery, fetch, state.nextPageToken);
    
    if (!data?.videos?.length) {
      state.hasMore = false;
      if (!state.videos.length) {
        state.error = 'No results found';
      }
      state.loading = false;
      state.initialLoad = false;
      return;
    }

    state.hasMore = !!data.nextPageToken;
    state.nextPageToken = data.nextPageToken;

    const uniqueChannelIds = [...new Set(data.videos.map((v: YouTubeVideo) => v.snippet.channelId))];
    await Promise.all(
      uniqueChannelIds.map(async (channelId: string) => {
        if (!state.channelDataMap[channelId]) {
          const channelData = await fetchChannel(channelId, fetch);
          state.channelDataMap[channelId] = channelData;
        }
      })
    );

    state.videos = state.nextPageToken 
      ? [...state.videos, ...data.videos] 
      : data.videos;
    
    state.loading = false;
    state.initialLoad = false;
  }

  function resetSearch() {
    state = {
      ...state,
      videos: [],
      nextPageToken: undefined,
      hasMore: true,
      error: null,
      channelDataMap: {},
      initialLoad: true
    };
  }

  let searchTimeout: ReturnType<typeof setTimeout>;
  
  $effect(() => {
    const newQuery = $page.url.searchParams.get('q');
    if (newQuery !== state.searchQuery) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchQuery = newQuery || '';
        if (state.searchQuery) {
          resetSearch();
          loadMore();
        } else {
          state.loading = false;
          state.initialLoad = false;
        }
      }, 300);
    }
  });

  onMount(() => {
    if (state.searchQuery) {
      loadMore();
    } else {
      state.loading = false;
      state.initialLoad = false;
    }
  });
</script>

<!-- Search Results -->
<div 
  class="max-w-[1096px] mx-auto w-full px-4  pb-12 "
  transition:fade={{ duration: 200 }}
>
  {#if state.initialLoad && state.loading}
    <div class="space-y-8 flex flex-col items-center" transition:fade={{ duration: 200 }}>
      {#each Array(8) as _}
        <div class="flex flex-col md:flex-row gap-4 animate-pulse max-w-[850px] w-full p-2">
          <!-- Thumbnail Skeleton -->
          <div class="w-full md:w-[360px] aspect-video bg-hover-bg rounded-xl"></div>
          
          <!-- Info Skeleton -->
          <div class="flex-1 py-1 space-y-4">
            <!-- Title -->
            <div class="h-5 bg-hover-bg rounded w-3/4"></div>
            
            <!-- Channel Info -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-hover-bg"></div>
              <div class="h-4 bg-hover-bg rounded w-1/4"></div>
            </div>
            
            <!-- Stats -->
            <div class="flex gap-2">
              <div class="h-3 bg-hover-bg rounded w-20"></div>
              <div class="h-3 bg-hover-bg rounded w-24"></div>
            </div>
            
            <!-- Description -->
            <div class="space-y-2">
              <div class="h-3 bg-hover-bg rounded w-full"></div>
              <div class="h-3 bg-hover-bg rounded w-2/3"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if state.error}
    <div 
      class="text-red-500 text-center p-4 rounded-lg bg-red-500/10" 
      transition:fade={{ duration: 200 }}
    >
      {state.error}
    </div>
  {:else if state.videos.length === 0 && !state.initialLoad}
    <div 
      class="text-center py-12"
      transition:fade={{ duration: 200 }}
    >
      <p class="text-xl">No results found for "{state.searchQuery}"</p>
      <p class="text-gray-400 mt-3 text-base">
        Try different keywords or check your spelling
      </p>
    </div>
  {:else}
    <div 
      class="space-y-8 flex flex-col items-center"
      transition:fade={{ duration: 200 }}
    >
      {#each state.videos as video (video.id)}
        <div class="group hover:bg-yt-dark rounded-xl transition-colors max-w-[850px] w-full">
          <div class="p-2">
            <VideoCard 
              {video} 
              compact={true}
              thumbnailClass="w-full md:w-[360px]"
            />
          </div>
        </div>
      {/each}
      
      <div class="w-full max-w-[850px]">
        <InfiniteScroll
          loading={state.loading}
          hasMore={state.hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  {/if}
</div> 