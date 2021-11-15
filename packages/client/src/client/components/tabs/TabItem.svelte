<script>
  import { toTitleCase } from '@vitebook/core';

  import { useTabsRegistry } from './tabsRegistry';

  /** @type {string} */
  export let value;
  /** @type {string} */
  export let label = value ? toTitleCase(value) : 'Unknown';

  const { addTab, selectTab, currentValue } = useTabsRegistry();

  addTab({ value, label });

  $: selected = $currentValue === value;

  function onSelect() {
    selectTab(value);
  }
</script>

<li
  class="tab __vbk__"
  role="tab"
  aria-selected={selected ? 'true' : 'false'}
  tabindex="0"
  class:selected
  on:pointerdown={onSelect}
  on:keydown={(e) => e.key === 'Enter' && onSelect()}
>
  <slot>
    {label}
  </slot>
</li>

<style>
  .tab[role='tab'] {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.15rem;
    margin: 0;
    cursor: pointer;
    border-radius: 0 !important;
    font-weight: 500;
    transition: var(--vbk--color-transition);
  }

  .tab.selected {
    color: var(--vbk--color-primary);
    border-bottom: 0.15rem solid var(--vbk--color-primary);
  }
</style>
