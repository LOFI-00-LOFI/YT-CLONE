<script lang="ts">
  import { 
    Menu, 
    Search,
    Video,
    Bell, 
    X 
  } from 'lucide-svelte';
  import { isSearchExpanded } from '$lib/stores/ui';
  import { goto } from '$app/navigation';
  
  export let toggleSidebar: () => void;
  let searchQuery = '';

  function handleSearch(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) {
      goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      isSearchExpanded.set(false);
    }
  }

  function toggleSearch() {
    isSearchExpanded.update(value => !value);
  }
</script>

<header class="bg-yt-black flex justify-between items-center px-4 h-14 fixed w-full top-0 z-50">
  <div class="flex items-center gap-4" class:hidden={$isSearchExpanded}>
    <button 
      class="p-2 hover:bg-yt-dark rounded-full"
      on:click={toggleSidebar}
    >
      <Menu size={24} />
    </button>
    
    <a href="/" class="flex items-center">
      <img 
        src="/youtube-logo.png" 
        alt="YouTube" 
        class="h-5"
      />
      <span class="ml-1 text-xs align-top">IN</span>
    </a>
  </div>

  <!-- Search Form -->
  <form 
    on:submit={handleSearch} 
    class="flex-1 max-w-2xl mx-4 hidden md:flex"
  >
    <input
      type="text"
      placeholder="Search"
      bind:value={searchQuery}
      class="w-full px-4 py-2 bg-yt-black border border-yt-dark rounded-l-full focus:border-blue-500 outline-none"
    />
    <button 
      type="submit"
      class="px-6 py-2 bg-yt-dark border border-l-0 border-yt-dark rounded-r-full hover:bg-yt-secondary"
    >
      <Search size={20} />
    </button>
  </form>

  <!-- Mobile Search -->
  {#if $isSearchExpanded}
    <form 
      on:submit={handleSearch} 
      class="flex-1 flex md:hidden items-center gap-2"
    >
      <button 
        type="button"
        class="p-2"
        on:click={toggleSearch}
      >
        <X size={24} />
      </button>
      <input
        type="text"
        placeholder="Search"
        bind:value={searchQuery}
        class="flex-1 px-4 py-2 bg-yt-black border border-yt-dark rounded-full focus:border-blue-500 outline-none"
      />
    </form>
  {/if}

  <div class="flex items-center gap-2" class:hidden={$isSearchExpanded}>
    <button 
      class="p-2 hover:bg-yt-dark rounded-full md:hidden"
      on:click={toggleSearch}
    >
      <Search size={24} />
    </button>

    <button class="p-2 hover:bg-yt-dark rounded-full">
      <Video size={24} />
    </button>
    
    <button class="p-2 hover:bg-yt-dark rounded-full">
      <Bell size={24} />
    </button>

    <button class="w-8 h-8 rounded-full overflow-hidden">
      <img 
        src="/default-avatar.png" 
        alt="Profile" 
        class="w-full h-full object-cover"
      />
    </button>
  </div>
</header>

<!-- Spacer to prevent content from hiding under fixed header -->
<div class="h-14"></div> 