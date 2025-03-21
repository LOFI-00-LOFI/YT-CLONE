<script lang="ts">
	import { fade } from 'svelte/transition';
	
	let { size = 'md' } = $props<{
		size?: string;
	}>();

	// Define size classes
	const sizeClass = size === 'sm' ? 'h-4 w-4' : 
	                 size === 'lg' ? 'h-12 w-12' : 
	                 'h-8 w-8'; // Default to medium
</script>

<div
	class="animate-spin rounded-full border-b-2 border-text-primary {sizeClass}"
	transition:fade
></div>
