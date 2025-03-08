<script lang="ts">
  import VideoGrid from "$lib/components/VideoGrid.svelte";
  import CategoryPills from "$lib/components/CategoryPills.svelte";
  import { sidebarOpen } from '$lib/stores/ui';
  import { currentCategory } from '$lib/stores/category';
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
  import { fetchVideos, type YouTubeVideo } from '$lib';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { fade } from 'svelte/transition';

  let videos: YouTubeVideo[] = [];
  let loading = true;
  let error: string | null = null;
  let nextPageToken: string | undefined = undefined;
  let hasMore = true;

  async function loadVideos(pageToken?: string) {
    try {
      loading = true;
      error = null;
      const data = await fetchVideos(fetch, { 
        pageToken, 
        category: $currentCategory 
      });
      
      if (pageToken) {
        videos = [...videos, ...data.videos];
      } else {
        videos = data.videos;
      }
      nextPageToken = data.nextPageToken;
      hasMore = !!data.nextPageToken;
    } catch (e) {
      error = 'Failed to load videos';
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (!nextPageToken || loading) return;
    loading = true;
    await loadVideos(nextPageToken);
  }

  // Initial load
  loadVideos();

  // Watch category changes to reset and reload
  $: if ($currentCategory) {
    videos = [];
    nextPageToken = undefined;
    hasMore = true;
    loading = true;
    loadVideos();
  }
</script>

<div class="flex flex-col">
  <CategoryPills />
  
  <div class="px-4 md:px-6 lg:px-8 pb-4 max-w-[2400px] mx-auto w-full">
    <VideoGrid sidebarOpen={$sidebarOpen} />
  </div>

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
