<script>
  import Addon from '../Addon.svelte';

  export let title = 'Events';
  export let icon = undefined;
</script>

<Addon {title} {icon}>
  <slot />
</Addon>
