<script lang="ts">
  import "../app.css";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import Header from "$lib/components/Header.svelte";
  import { page } from '$app/stores';
  import { sidebarOpen } from '$lib/stores/ui';
  import  { Toaster } from 'svelte-french-toast';

  
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

<div class="h-screen flex flex-col bg-bg-primary text-text-primary">
  <Toaster position="top-right" />
  <Header {toggleSidebar} />
  
  <div class="flex flex-1 overflow-hidden">
    <Sidebar open={$sidebarOpen} />
    
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</div>