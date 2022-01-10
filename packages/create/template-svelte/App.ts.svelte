<script lang="ts">
  /** __APP_IMPORTS__ **/ import type { SvelteComponent } from 'svelte';

  export let component: typeof SvelteComponent;
</script>

<svelte:component this={component} />
