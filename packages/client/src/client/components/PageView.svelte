<script>
  import { currentRoute } from '../stores/currentRoute';
</script>

<svelte:component this={$currentRoute?.component} />
