<script lang="ts">
  import "../app.css";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Header from "$lib/components/Header.svelte";
  import { page } from '$app/stores';
  import { sidebarOpen } from '$lib/stores/ui';
  
  function toggleSidebar() {
    sidebarOpen.update(value => !value);
  }

  // Check if we're on the watch page
  $: isWatchPage = $page.url.pathname === '/watch';

  export function load() {
    return {
      sidebarOpen
    };
  }
</script>

<div class="h-screen flex flex-col bg-yt-black text-white">
  <Header {toggleSidebar} />
  
  <div class="flex flex-1 overflow-hidden">
    <div 
      class:absolute={isWatchPage} 
      class="z-50 h-[calc(100vh-56px)] bg-yt-black"
    >
      <Sidebar open={$sidebarOpen} />
    </div>
    
    <main class="flex-1 overflow-y-auto pt-4">
      <slot />
    </main>
  </div>
</div>