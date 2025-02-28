<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';
  import RelatedVideos from '$lib/components/RelatedVideos.svelte';
  import VideoInfo from '$lib/components/VideoInfo.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import { fetchVideoDetails, type YouTubeVideo } from '$lib/services/youtube';
  import { sidebarOpen } from '$lib/stores/ui';
  import { fade } from 'svelte/transition';

  let loading = true;
  let error: string | null = null;
  let video: YouTubeVideo | null = null;
  let videoId = $page.url.searchParams.get('v');

  async function loadVideo() {
    try {
      loading = true;
      error = null;
      const data = await fetchVideoDetails(videoId);
      video = data;
    } catch (e) {
      error = 'Failed to load video';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $: if ($page.url.searchParams.get('v') !== videoId) {
    videoId = $page.url.searchParams.get('v');
    loadVideo();
  }

  onMount(() => {
    loadVideo();
  });
</script>

<!-- Loading State -->
{#if loading}
<div class="flex flex-col lg:flex-row gap-x-6 p-4 sm:px-6 lg:px-8 ml-0 md:ml-1 min-h-screen max-w-[2400px] mx-auto">
  <!-- Main Content Skeleton -->
  <div class="flex-1 min-w-0 max-w-full lg:max-w-[calc(100%-426px)]">
    <!-- Video Player Skeleton -->
    <div class="aspect-video bg-hover-bg rounded-xl animate-pulse"></div>
    
    <!-- Video Info Skeleton -->
    <div class="mt-4 animate-pulse">
      <div class="h-6 bg-hover-bg rounded w-3/4 mb-4"></div>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-hover-bg rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-hover-bg rounded w-1/4 mb-2"></div>
          <div class="h-3 bg-hover-bg rounded w-1/6"></div>
        </div>
        <div class="w-24 h-9 bg-hover-bg rounded-full"></div>
      </div>
    </div>
  </div>

  <!-- Related Videos Skeleton -->
  <div class="hidden lg:block w-[400px] flex-shrink-0">
    <div class="sticky top-[88px] space-y-4">
      {#each Array(4) as _}
        <div class="flex gap-2">
          <div class="w-40 aspect-video bg-hover-bg rounded-xl"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-hover-bg rounded w-3/4"></div>
            <div class="h-3 bg-hover-bg rounded w-1/2"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Error State -->
{:else if error}
<div class="flex items-center justify-center min-h-[50vh]">
  <div class="text-red-500 text-center p-4 rounded-lg bg-red-500/10">
    {error}
  </div>
</div>

<!-- Content State -->
{:else if video}
<div class="flex flex-col lg:flex-row gap-x-6 p-4 sm:px-6 lg:px-8 ml-0 md:ml-1 min-h-screen max-w-[2400px] mx-auto">
  <div class="flex-1 min-w-0 max-w-full lg:max-w-[calc(100%-426px)]">
    <!-- Video Player -->
    <div class="aspect-video bg-black rounded-xl overflow-hidden">
      <VideoPlayer {video} />
    </div>

    <!-- Video Info -->
    <div class="mt-4">
      <VideoInfo {video} />
    </div>
    
    <!-- Comments - Show on desktop -->
    <div class="mt-6 hidden lg:block">
      {#if videoId}
        <Comments {videoId} />
      {/if}
    </div>
  </div>

  <!-- Related Videos -->
  <div class="hidden lg:block w-[400px] flex-shrink-0">
    <div class="sticky top-[0px]">
      <RelatedVideos currentVideoId={video.id} />
    </div>
  </div>

  <!-- Mobile Layout -->
  <div class="lg:hidden">
    <!-- Comments for mobile -->
    <div class="mt-6">
      {#if videoId}
        <Comments {videoId} />
      {/if}
    </div>
    
    <!-- Related Videos for mobile -->
    <div class="mt-6">
      <RelatedVideos currentVideoId={video?.id} />
    </div>
  </div>
</div>
{/if} 