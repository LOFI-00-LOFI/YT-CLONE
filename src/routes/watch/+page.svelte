<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';
  import RelatedVideos from '$lib/components/RelatedVideos.svelte';
  import VideoInfo from '$lib/components/VideoInfo.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import { fetchVideoDetails, type YouTubeVideo } from '$lib/services/youtube';
  import { sidebarOpen } from '$lib/stores/ui';

  let video: YouTubeVideo | null = null;
  let loading = true;
  let error: string | null = null;
  let videoId = $page.url.searchParams.get('v');

  async function loadVideo(id: string | null) {
    if (!id) return;
    try {
      loading = true;
      error = null;
      const data = await fetchVideoDetails(id);
      video = data;
    } catch (e) {
      error = 'Failed to load video details';
    } finally {
      loading = false;
    }
  }

  $: if ($page.url.searchParams.get('v') !== videoId) {
    videoId = $page.url.searchParams.get('v');
    loadVideo(videoId);
  }

  onMount(() => {
    loadVideo(videoId);
  });
</script>

<div class="flex flex-col lg:flex-row gap-x-6 p-4 sm:px-6 lg:px-8 ml-0 md:ml-10 min-h-screen max-w-[2400px] mx-auto">
  <!-- Main Content -->
  <div class="flex-1 min-w-0 max-w-full lg:max-w-[calc(100%-426px)]">
    {#if loading}
      <div class="aspect-video bg-yt-dark animate-pulse rounded-xl" />
    {:else if error}
      <div class="text-red-500 p-4 text-center">{error}</div>
    {:else if video}
      <!-- Video Player -->
      <div class="w-full mx-auto">
        <VideoPlayer {video} autoplay={true} />
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
          <RelatedVideos currentVideoId={videoId} />
        </div>
      </div>
    {/if}
  </div>

  <!-- Desktop Related Videos -->
  <div class="hidden lg:block w-[400px] flex-shrink-0">
    <div class="sticky top-[88px]">
      <RelatedVideos currentVideoId={videoId} />
    </div>
  </div>
</div> 