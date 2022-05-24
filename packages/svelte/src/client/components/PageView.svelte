<script>
  import { getPage } from '../context';

  const page = getPage();
</script>

<svelte:component this={$page.default} {...$page.data} />
