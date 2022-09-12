<script>
  import { getRouteStore } from './context';

  const route = getRouteStore();

  export let index = 0;

  $: layout = $route.layouts[index];
</script>

{#if index < $route.layouts.length}
  <svelte:component this={layout.module.default}>
    <svelte:self index={index + 1}>
      <slot />
    </svelte:self>
  </svelte:component>
{:else}
  <slot />
{/if}
