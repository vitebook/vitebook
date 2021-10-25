<script>
  import { currentRoute } from '../stores/currentRoute';
  import Component from './Component.svelte';
</script>

<Component this={$currentRoute?.component} />
