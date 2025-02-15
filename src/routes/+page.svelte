<script lang="ts">
  import VideoGrid from "$lib/components/VideoGrid.svelte";
  import CategoryPills from "$lib/components/CategoryPills.svelte";
  import { sidebarOpen } from '$lib/stores/ui';
</script>

<div class="flex flex-col">
  <CategoryPills />
  
  <div class="px-4 md:px-6 mt-10 lg:px-8 pb-4 max-w-[2400px] mx-auto w-full">
    <VideoGrid sidebarOpen={$sidebarOpen} />
  </div>
</div>
