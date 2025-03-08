<script lang="ts">
  /// <reference types="svelte" />
  import { 
    Home, 
    Film, 
    Users, 
    Library, 
    History, 
    Video, 
    Clock, 
    ThumbsUp,
    TrendingUp,
    ShoppingBag,
    Music,
    Clapperboard,
    Radio,
    Gamepad2,
    Newspaper,
    Trophy,
    GraduationCap,
    Shirt,
    Podcast
  } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { sidebarOpen } from '$lib/stores/ui';
  import { currentCategory } from '$lib/stores/category';
  
  export let open = false;

  // Add this to check if we're on the watch page
  $: isWatchPage = $page.url.pathname === '/watch';
  $: isHomePage = $page.url.pathname === '/';

  const mainLinks = [
    { icon: Home, label: "Home", category: "home" },
    { icon: Film, label: "Shorts", category: "" },
    { icon: Users, label: "Subscriptions", category: "" }
  ];

  const secondaryLinks = [
    { icon: Library, label: "Library", category: "library" },
    { icon: History, label: "History", category: "history" },
    // { icon: Video, label: "Your videos", category: "your-videos" },
    // { icon: Clock, label: "Watch later", category: "watch-later" },
    { icon: ThumbsUp, label: "Liked videos", category: "liked-videos" }
  ];

  const exploreLinks = [
    // { icon: TrendingUp, label: "Trending", category: "trending" },
    { icon: ShoppingBag, label: "Shopping", category: "shopping" },
    { icon: Music, label: "Music", category: "music" },
    { icon: Clapperboard, label: "Movies", category: "movies" },
    { icon: Radio, label: "Live", category: "live" },
    { icon: Gamepad2, label: "Gaming", category: "gaming" },
    { icon: Newspaper, label: "News", category: "news" },
    // { icon: Trophy, label: "Sports", category: "sports" },
    // { icon: GraduationCap, label: "Learning", category: "learning" },
    // { icon: Shirt, label: "Fashion & Beauty", category: "fashion" },
    // { icon: Podcast, label: "Podcasts", category: "podcasts" }
  ];

  function handleClick(category: string) {
    currentCategory.set(category);
    if (!isHomePage) {
      goto('/');
    }
    if (window.innerWidth < 1024) {
      sidebarOpen.set(false);
    }
  }
</script>

<!-- Full Sidebar -->
<aside
  class="fixed md:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] 
         bg-bg-primary overflow-y-auto pb-4 transition-transform duration-200
         {open ? 'w-60' : 'w-0 md:w-[72px]'}"
  class:md:relative={isWatchPage}
>
  <!-- Only show content if sidebar is open on mobile or always show on desktop -->
  <div class="px-3 py-1 {!open && 'hidden md:block'}">
    <!-- Main Links -->
    <div class="{open ? 'border-b border-border-color pb-3' : ''}">
      {#each mainLinks as link}
        <button
          class="w-full flex items-center  gap-6 px-3 py-2 my-2 hover:bg-hover-bg rounded-lg"
          class:justify-center={!open}
          class:bg-hover-bg={isHomePage && link.category === 'home'}
          onclick={() => handleClick(link.category)}
          title={!open ? link.label : ''}
        >
          <svelte:component this={link.icon} size={24} class="text-text-primary" />
          {#if open}
            <span class="text-text-primary">{link.label}</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Secondary Links - Show in both modes -->
    <div class="{open ? 'border-b border-border-color py-3' : 'py-3'}">
      {#each secondaryLinks as link}
        <button
          class="w-full flex items-center gap-6 px-3 py-2 my-2 hover:bg-hover-bg rounded-lg"
          class:justify-center={!open}
          class:bg-hover-bg={$currentCategory === link.category}
          onclick={() => handleClick(link.category)}
          title={!open ? link.label : ''}
        >
          <svelte:component this={link.icon} size={24} class="text-text-primary" />
          {#if open}
            <span class="text-text-primary">{link.label}</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Explore - Show in both modes -->
    <div class="pt-3">
      {#if open}
        <h3 class="px-3 mb-1 text-lg text-text-primary">Explore</h3>
      {/if}
      {#each exploreLinks as link}
        <button
          class="w-full flex items-center gap-6 px-3 py-2 my-2 hover:bg-hover-bg rounded-lg"
          class:justify-center={!open}
          class:bg-hover-bg={$currentCategory === link.category}
          onclick={() => handleClick(link.category)}
          title={!open ? link.label : ''}
        >
          <svelte:component this={link.icon} size={24} class="text-text-primary" />
          {#if open}
            <span class="text-text-primary">{link.label}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</aside>

<!-- Overlay for mobile -->
{#if open}
  <div
    class="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
    role="button"
    tabindex="0"
    onclick={() => open = false}
    onkeydown={e => e.key === 'Escape' && (open = false)}
    aria-label="Close sidebar"
  ></div>
{/if}

<style>
  aside {
    scrollbar-width: thin;
  }
  aside::-webkit-scrollbar {
    width: 8px;
  }
  aside::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }
  aside::-webkit-scrollbar-thumb {
    background: var(--text-secondary);
    border-radius: 4px;
  }
</style> 