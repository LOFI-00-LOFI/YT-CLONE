<script lang="ts">
	import type { YouTubeVideo } from '$lib';

	export let video: YouTubeVideo;
	export let autoplay = true;
</script>

<div class="w-full">
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
</div>
