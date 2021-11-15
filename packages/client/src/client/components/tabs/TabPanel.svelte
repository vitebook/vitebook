<script>
  import { useTabsRegistry } from './tabsRegistry';

  /** @type {string} */
  export let value;

  const { currentValue } = useTabsRegistry();

  $: selected = $currentValue === value;
</script>

<div class="tabs__panel" role="tabpanel" hidden={!selected}>
  <slot />
</div>
