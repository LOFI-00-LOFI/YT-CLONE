<script lang="ts">
	import type { YouTubeVideo } from '$lib';

	let { video, autoplay = true } = $props<{
		video?: YouTubeVideo;
		autoplay?: boolean;
	}>();
</script>

<div class="w-full">
	{#if video}
		<div class="relative aspect-video">
			<iframe
				class="absolute inset-0 w-full h-full rounded-xl"
				src="https://www.youtube.com/embed/{video.id}?autoplay={autoplay ? 1 : 0}&playsinline=1&rel=0"
				title={video.snippet.title}
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
		</div>
	{:else}
		<div class="aspect-video bg-hover-bg rounded-xl flex items-center justify-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
		</div>
	{/if}
</div>
