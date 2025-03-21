<script lang="ts">
  import { onMount } from 'svelte';
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';
  import RelatedVideos from '$lib/components/RelatedVideos.svelte';
  import VideoInfo from '$lib/components/VideoInfo.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import type { YouTubeVideo } from '$lib';
  import { fade } from 'svelte/transition';

  // Get data from server using $props() for Svelte 5 runes mode
  let { data } = $props();
  
  // Extract video and videoId from data (data comes from +page.server.ts)
  let video = $derived(data?.video);
  let videoId = $derived(data?.videoId);
  
  // Simple loading state
  let loading = $state(true);

  onMount(() => {
    loading = false;
  });
</script>

<div transition:fade={{ duration: 200 }}>
  <div class="flex flex-col lg:flex-row gap-x-4 xl:gap-x-6 p-4 sm:px-6 lg:px-8 w-full min-h-screen max-w-[2400px] mx-auto transition-all duration-300">
    <div class="flex-1 min-w-0 w-full lg:max-w-[calc(100%-380px)]">
      {#if loading}
        <!-- Loading state -->
        <div class="aspect-video bg-hover-bg rounded-xl flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        <div class="mt-4 animate-pulse">
          <div class="h-6 bg-hover-bg rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-hover-bg rounded w-1/2"></div>
        </div>
      {:else if !video}
        <!-- Error state -->
        <div class="aspect-video bg-red-900/20 rounded-xl flex items-center justify-center">
          <div class="text-red-500 p-4">Video not found</div>
        </div>
      {:else}
        <!-- Video Player -->
        <div class="aspect-video bg-black rounded-xl overflow-hidden">
          <VideoPlayer video={video} />
        </div>

        <!-- Video Info -->
        <div class="mt-4">
          <VideoInfo video={video} />
        </div>
        
        <!-- Comments - Show on desktop -->
        <div class="mt-6 hidden lg:block">
          {#if videoId}
            <Comments {videoId} />
          {/if}
        </div>
      {/if}
    </div>

    <!-- Related Videos -->
    <div class="hidden lg:block w-full lg:w-[350px] xl:w-[380px] flex-shrink-0">
      <div class="sticky top-[0]">
        <h3 class="text-lg font-medium mb-4">Related Videos</h3>
        {#if video}
          <RelatedVideos currentVideoId={video.id} />
        {:else}
          <div class="space-y-4 animate-pulse">
            {#each Array(5) as _}
              <div class="flex gap-2">
                <div class="w-40 aspect-video bg-hover-bg rounded-xl"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-hover-bg rounded w-3/4"></div>
                  <div class="h-3 bg-hover-bg rounded w-1/2"></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="lg:hidden mt-6">
      <div class="grid grid-cols-1 gap-6">
        <!-- Comments for mobile -->
        <div>
          {#if videoId}
            <Comments {videoId} />
          {/if}
        </div>
        <!-- Related Videos for mobile -->
        <div>
          <h3 class="text-lg font-medium mb-4">Related Videos</h3>
          {#if video}
            <RelatedVideos currentVideoId={video.id} />
          {:else}
            <div class="space-y-4 animate-pulse">
              {#each Array(3) as _}
                <div class="flex gap-2">
                  <div class="w-40 aspect-video bg-hover-bg rounded-xl"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-hover-bg rounded w-3/4"></div>
                    <div class="h-3 bg-hover-bg rounded w-1/2"></div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div> 