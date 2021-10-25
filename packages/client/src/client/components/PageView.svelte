<script>
  import { currentRoute } from '../stores/currentRoute';
</script>

{#if 'adapter' in $currentRoute.component}
  <svelte:component
    this={$currentRoute.component.adapter}
    component={$currentRoute.component.component}
  />
{:else}
  <svelte:component this={$currentRoute.component} />
{/if}
