<script>
  import { getRouteStore } from './context';

  const route = getRouteStore();
</script>

<svelte:component this={$route.module.default} />
