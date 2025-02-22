<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4 bg-bg-primary">
  <h1 class="text-4xl font-bold mb-4 text-text-primary">{$page.status}</h1>
  <p class="text-text-secondary mb-8">{$page.error?.message}</p>
  <a 
    href="/" 
    class="bg-bg-secondary hover:bg-hover-bg px-6 py-2 rounded-full text-text-primary"
  >
    Go Home
  </a>
</div> 