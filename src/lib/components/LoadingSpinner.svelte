<script lang="ts">
	export let size = 'md';

	const sizes = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12'
	};
</script>

{#key size}
	<div
		class="animate-spin rounded-full border-b-2 border-text-primary {sizes[size]}"
		transition:fade
	></div>
{/key}
