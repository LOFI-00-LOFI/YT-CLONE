<script lang="ts">
	import { onDestroy } from 'svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';

	let { 
		onLoadMore,
		hasMore = true,
		threshold = 100,
		loading = false
	} = $props<{
		onLoadMore: () => Promise<void>;
		hasMore?: boolean;
		threshold?: number;
		loading?: boolean;
	}>();

	// Use a regular DOM reference, not reactive state
	let container: HTMLElement | null = null;
	// Use a regular variable, not reactive state
	let observer: IntersectionObserver | null = null;
	// Flag to track if already set up
	let isObserverSet = false;
	// Cooldown to prevent too frequent calls
	let isOnCooldown = false;
	// Track if component is mounted
	let isMounted = true;

	// Handle the container ref being set
	function handleRef(node: HTMLElement) {
		if (!node || isObserverSet) return;
		
		container = node;
		setupObserver();
		
		// Return destroy function
		return {
			destroy() {
				if (observer) {
					observer.disconnect();
					observer = null;
				}
				isObserverSet = false;
				isMounted = false;
			}
		};
	}

	// Set up the observer once
	function setupObserver() {
		if (!container || isObserverSet) return;
		
		isObserverSet = true;
		observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (first.isIntersecting && hasMore && !loading && !isOnCooldown && isMounted) {
					// Set cooldown flag to prevent rapid firing
					isOnCooldown = true;
					
					// Call onLoadMore
					onLoadMore()
						.finally(() => {
							// Reset cooldown after a short delay
							setTimeout(() => {
								if (isMounted) {
									isOnCooldown = false;
								}
							}, 500);
						});
				}
			},
			{
				rootMargin: `${threshold}px`
			}
		);

		observer.observe(container);
	}

	// Clean up on component destruction
	onDestroy(() => {
		isMounted = false;
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	});
</script>

<div use:handleRef class="w-full py-4 flex justify-center">
	{#if loading}
		<LoadingSpinner size="md" />
	{/if}
</div>
