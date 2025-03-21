<script lang="ts">
  // Number of video skeletons to show
  export let videoCount = 12;
</script>

<div class="flex flex-col min-h-screen animate-pulse">
  <!-- Banner Skeleton -->
  <div class="w-full h-[200px] bg-hover-bg rounded-b-lg"></div>
  
  <!-- Channel Info Skeleton -->
  <div class="max-w-[1200px] mx-auto w-full px-4 py-4 sm:py-6">
    <div class="flex gap-6 items-center">
      <div class="w-[128px] h-[128px] rounded-full bg-hover-bg"></div>
      <div class="flex-1 space-y-4">
        <div class="h-6 bg-hover-bg rounded w-1/4"></div>
        <div class="h-4 bg-hover-bg rounded w-1/3"></div>
        <div class="h-4 bg-hover-bg rounded w-1/2"></div>
      </div>
      <div class="w-28 h-10 bg-hover-bg rounded-full"></div>
    </div>

    <!-- Tabs Skeleton -->
    <div class="mt-8 border-b border-border-color pb-2">
      <div class="flex gap-8 overflow-x-auto no-scrollbar">
        {#each Array(8) as _, i}
          <div class="h-4 bg-hover-bg rounded w-16" style="opacity: {1 - i * 0.1}"></div>
        {/each}
      </div>
    </div>

    <!-- Videos Grid Skeleton -->
    <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {#each Array(videoCount) as _}
        <div class="flex flex-col gap-2">
          <div class="aspect-video bg-hover-bg rounded-xl"></div>
          <div class="flex gap-2 mt-2">
            <div class="w-9 h-9 rounded-full bg-hover-bg flex-shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-hover-bg rounded w-full"></div>
              <div class="h-3 bg-hover-bg rounded w-2/3"></div>
              <div class="h-3 bg-hover-bg rounded w-1/2"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Shimmer animation effect */
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
</style> 