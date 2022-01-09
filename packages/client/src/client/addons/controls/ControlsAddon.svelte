<script>
  import Addon from '../Addon.svelte';

  export let title = 'Controls';
  export let icon = undefined;
</script>

<Addon {title} {icon}>
  <slot />
</Addon>
