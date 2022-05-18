<script>
  import { onMount } from 'svelte';

  let hasMounted = false;

  onMount(() => {
    hasMounted = true;
  });
</script>

{#if hasMounted}
  <slot />
{/if}
