<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    fetchPopularVideos, 
    fetchTrendingVideos,
    fetchMusicVideos,
    fetchGamingVideos,
    fetchNewsVideos,
    fetchSportsVideos,
    fetchLearningVideos,
    fetchFashionVideos,
    type YouTubeVideo 
  } from '$lib/services/youtube';
  import VideoCard from './VideoCard.svelte';
  import { currentCategory } from '$lib/stores/category';

  let videos: YouTubeVideo[] = [];
  let loading = true;
  let error: string | null = null;

  async function loadVideos(category: string) {
    try {
      loading = true;
      error = null;
      let data;

      switch (category) {
        case 'trending':
          data = await fetchTrendingVideos();
          break;
        case 'music':
          data = await fetchMusicVideos();
          break;
        case 'gaming':
          data = await fetchGamingVideos();
          break;
        case 'news':
          data = await fetchNewsVideos();
          break;
        case 'sports':
          data = await fetchSportsVideos();
          break;
        case 'learning':
          data = await fetchLearningVideos();
          break;
        case 'fashion':
          data = await fetchFashionVideos();
          break;
        default:
          data = await fetchPopularVideos();
      }

      videos = data.videos;
    } catch (e) {
      error = 'Failed to load videos';
    } finally {
      loading = false;
    }
  }

  // Subscribe to category changes
  $: {
    if ($currentCategory) {
      loadVideos($currentCategory);
    }
  }

  onMount(() => {
    loadVideos($currentCategory);
  });
</script>

{#if error}
  <div class="text-red-500 p-4 text-center">{error}</div>
{/if}

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {#each videos as video}
    <VideoCard {video} />
  {/each}
</div>

{#if loading}
  <div class="flex justify-center p-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
{/if} 