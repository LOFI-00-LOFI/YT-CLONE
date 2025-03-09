<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from './LoadingSpinner.svelte';

	export let onLoadMore: () => Promise<void>;
	export let hasMore: boolean = true;
	export let threshold = 100;
	export let loading = false;

	let container: HTMLElement;
	let observer: IntersectionObserver;

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (first.isIntersecting && hasMore && !loading) {
					onLoadMore();
				}
			},
			{
				rootMargin: `${threshold}px`
			}
		);

		observer.observe(container);

		return () => observer.disconnect();
	});
</script>

<div bind:this={container} class="w-full py-4 flex justify-center">
	{#if loading}
		<LoadingSpinner size="md" />
	{/if}
</div>
