<script lang="ts">
  import { page } from '$app/stores';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { formatNumber } from '$lib/utils/format';
  import type { YouTubeVideo } from '$lib';
  import { ChannelSkeleton } from '$lib/components';

  export let data;
  const { channel, videos } = data;

  const tabs = [
    'Home',
    'Videos',
    'Shorts',
    'Live',
    'Playlists',
    'Community',
    'Channels',
    'About'
  ];

  let selectedTab = 'Home';
</script>

{#if !channel}
  <ChannelSkeleton videoCount={12} />
{:else}
  <div class="flex flex-col min-h-screen">
    <!-- Channel Banner -->
    {#if channel.brandingSettings?.image?.bannerExternalUrl}
      <div class="w-full h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] relative overflow-hidden">
        <img
          src={`${channel.brandingSettings.image.bannerExternalUrl}=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`}
          alt="Channel banner"
          class="w-full absolute h-full object-cover"
        />
      </div>
    {/if}

    <!-- Channel Info -->
    <div class="max-w-[1200px] mx-auto w-full px-4 py-4 sm:py-6">
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        <!-- Channel Avatar -->
        <div class="w-[80px] h-[80px] sm:w-[128px] sm:h-[128px] rounded-full overflow-hidden flex-shrink-0">
          <img
            src={channel.snippet.thumbnails.high.url}
            alt={channel.snippet.title}
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Channel Details -->
        <div class="flex-1 min-w-0">
          <h1 class="text-xl sm:text-2xl font-bold truncate">{channel.snippet.title}</h1>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-400 mt-1">
            <span class="text-xs sm:text-sm">@{channel.id}</span>
            <span class="hidden sm:inline">•</span>
            <span class="text-xs sm:text-sm">{formatNumber(channel.statistics.subscriberCount)} subscribers</span>
            {#if channel.statistics.videoCount}
              <span class="hidden sm:inline">•</span>
              <span class="text-xs sm:text-sm">{formatNumber(channel.statistics.videoCount)} videos</span>
            {/if}
          </div>
          <p class="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-2 max-w-[600px]">
            {channel.snippet.description}
          </p>
        </div>

        <!-- Subscribe Button -->
        <button class="bg-text-primary text-bg-primary px-4 py-2 rounded-full text-sm sm:text-base font-medium hover:opacity-90 whitespace-nowrap">
          Subscribe
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="mt-6 sm:mt-8 border-b border-border-color">
        <div class="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
          {#each tabs as tab}
            <button
              class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap
                     {selectedTab === tab ? 'border-b-2 border-text-primary' : 'text-text-secondary hover:text-text-primary'}"
              onclick={() => selectedTab = tab}
            >
              {tab}
            </button>
          {/each}
        </div>
      </div>

      <!-- Content -->
      <div class="mt-4 sm:mt-8">
        {#if selectedTab === 'Home' || selectedTab === 'Videos'}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
            {#each videos as video}
              <VideoCard {video} />
            {/each}
          </div>
        {:else}
          <div class="text-center text-text-secondary py-8 sm:py-12">
            This tab is not implemented in the demo
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style> 