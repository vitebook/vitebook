<script>
  import { getRouteStore } from './context';

  const route = getRouteStore();

  export let index = 0;

  $: branch = $route.branch[index];
</script>

{#if index < $route.branch.length}
  <svelte:component this={branch.module.default}>
    <svelte:self index={index + 1}>
      <slot />
    </svelte:self>
  </svelte:component>
{:else}
  <slot />
{/if}
