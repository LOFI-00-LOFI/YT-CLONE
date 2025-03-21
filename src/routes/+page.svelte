<script lang="ts">
  import CategoryPills from "$lib/components/CategoryPills.svelte";
  import { sidebarOpen } from '$lib/stores/ui';
  import { currentCategory } from '$lib/stores/category';
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
  import { fetchVideos, type YouTubeVideo } from '$lib';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { fade } from 'svelte/transition';

  // Get data from server
  let { initialVideos, initialNextPageToken } = $props<{
    initialVideos: YouTubeVideo[];
    initialNextPageToken?: string;
  }>();

  let videos = $state<YouTubeVideo[]>(initialVideos);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let nextPageToken = $state<string | undefined>(initialNextPageToken);
  let hasMore = $state(!!initialNextPageToken);
  
  // Use a non-reactive variable to prevent reactivity loops
  let lastLoadedCategory: string | null = null;
  // Track if we're already loading more to prevent duplicate calls
  let isLoadingMore = false;

  async function loadVideos(pageToken?: string) {
    // Exit early if we're already loading (prevents duplicate calls)
    if (loading) return;
    
    loading = true;
    error = null;
    const category = $currentCategory;
    
    // If already loaded this category and just appending more pages, don't mark as lastLoadedCategory
    if (!pageToken) {
      // Set non-reactive variable to track loaded category
      lastLoadedCategory = category;
    }
    
    const data = await fetchVideos(fetch, { 
      pageToken, 
      category
    });
    
    if (pageToken) {
      videos = [...videos, ...data.videos];
    } else {
      videos = data.videos;
    }
    
    nextPageToken = data.nextPageToken;
    hasMore = !!data.nextPageToken;
    loading = false;
    
    // If this was a loadMore operation, reset the flag
    if (pageToken) {
      isLoadingMore = false;
    }
  }

  async function loadMore() {
    // Prevent duplicate calls to loadMore
    if (!nextPageToken || loading || isLoadingMore) return;
    
    isLoadingMore = true;
    await loadVideos(nextPageToken);
  }

  // Watch category changes to reset and reload
  $effect(() => {
    const currentCat = $currentCategory;
    if (currentCat !== lastLoadedCategory && !loading) {
      videos = [];
      nextPageToken = undefined;
      hasMore = true;
      loadVideos();
    }
  });
</script>

<div class="flex flex-col">
  <CategoryPills />

  <div class="p-4 sm:px-6 lg:px-8 ml-0 md:ml-10">
    {#if error}
      <div class="text-red-500 text-center p-4" transition:fade>
        {error}
      </div>
    {:else}
      {#if loading && videos.length === 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4" transition:fade>
          {#each videos as video (video.id)}
            <VideoCard {video} />
          {/each}
        </div>

        <InfiniteScroll
          {loading}
          {hasMore}
          onLoadMore={loadMore}
        />
      {/if}
    {/if}
  </div>
</div>
