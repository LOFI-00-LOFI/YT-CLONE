<script lang="ts">
	import { Menu, Search, Video, Bell, Sun, Moon, X } from 'lucide-svelte';
	import { isSearchExpanded } from '$lib/stores/ui';
	import { isDarkMode } from '$lib/stores/theme';
	import { goto } from '$app/navigation';

	let { toggleSidebar } = $props<{
		toggleSidebar: () => void;
	}>();

	let searchQuery = $state('');

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			isSearchExpanded.set(false);
		}
	}

	function toggleSearch() {
		isSearchExpanded.update((value: boolean) => !value);
	}

	function toggleTheme() {
		isDarkMode.update((value: boolean) => !value);
		document.documentElement.setAttribute('data-theme', $isDarkMode ? 'dark' : 'light');
	}

	// Set initial theme
	$effect(() => {
		document.documentElement.setAttribute('data-theme', $isDarkMode ? 'dark' : 'light');
	});
</script>

<header
	class="bg-bg-primary border-b border-border-color flex justify-between items-center px-4 h-14 fixed w-full top-0 z-50"
>
	<div class="flex items-center gap-4" class:hidden={$isSearchExpanded}>
		<button class="p-2 hover:bg-hover-bg rounded-full" onclick={toggleSidebar}>
			<Menu size={24} class="text-text-primary" />
		</button>

		<a href="/" class="flex items-center">
			<img src={'/youtube-logo.png'} alt="YouTube" class="w-10" />
			<span class="ml-1 text-xs align-top text-text-primary">IN</span>
		</a>
	</div>

	<!-- Search Bar -->
	<form
		class="flex-1 max-w-[720px] flex justify-center items-center hidden md:flex"
		class:!flex={$isSearchExpanded}
		onsubmit={handleSearch}
	>
		{#if $isSearchExpanded}
			<button
				type="button"
				class="p-2 mr-2 hover:bg-hover-bg rounded-full md:hidden"
				onclick={() => isSearchExpanded.set(false)}
			>
				<X size={24} class="text-text-primary" />
			</button>
		{/if}

		<div class="flex w-full max-w-[600px]">
			<input
				type="text"
				placeholder="Search"
				bind:value={searchQuery}
				class="w-full px-4 py-2 bg-bg-secondary text-text-primary border border-border-color rounded-l-full focus:border-blue-500 outline-none"
			/>
			<button
				type="submit"
				class="px-6 py-2 bg-hover-bg border border-l-0 border-border-color rounded-r-full hover:bg-bg-secondary"
			>
				<Search size={20} class="text-text-primary" />
			</button>
		</div>
	</form>

	<!-- Right Actions -->
	<div class="flex items-center gap-2" class:hidden={$isSearchExpanded}>
		<button class="p-2 hover:bg-hover-bg rounded-full md:hidden" onclick={toggleSearch}>
			<Search size={24} class="text-text-primary" />
		</button>

		<button
			class="p-2 bg-bg-secondary hover:bg-hover-bg rounded-full flex items-center gap-2"
			onclick={toggleTheme}
			aria-label={$isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
			title={$isDarkMode ? 'Light mode' : 'Dark mode'}
		>
			{#if $isDarkMode}
				<Sun size={24} class="text-text-primary" />
			{:else}
				<Moon size={24} class="text-text-primary" />
			{/if}
		</button>

		<div class="hidden md:flex gap-2">
			<button class="p-2 bg-bg-secondary hover:bg-hover-bg rounded-full">
				<Video size={24} class="text-text-primary" />
			</button>

			<button class="p-2 bg-bg-secondary hover:bg-hover-bg rounded-full">
				<Bell size={24} class="text-text-primary" />
			</button>
		</div>

		<button class="w-8 h-8 rounded-full overflow-hidden bg-bg-secondary">
			<img src="/default-avatar.png" alt="Profile" class="w-full h-full object-cover" />
		</button>
	</div>
</header>

<!-- Spacer to prevent content from hiding under fixed header -->
<div class="h-14"></div>
