<script>
  import { getPageStore } from '../context';

  const page = getPageStore();
</script>

<svelte:component this={$page.default} {...$page.data} />
