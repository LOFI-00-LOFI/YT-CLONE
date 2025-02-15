<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4">
  <h1 class="text-4xl font-bold mb-4">{$page.status}</h1>
  <p class="text-gray-400 mb-8">{$page.error?.message}</p>
  <a 
    href="/" 
    class="bg-yt-dark hover:bg-yt-secondary px-6 py-2 rounded-full"
  >
    Go Home
  </a>
</div> 