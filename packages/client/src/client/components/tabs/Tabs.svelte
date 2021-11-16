<script>
  import { isString } from '@vitebook/core';

  import { setContext, onDestroy, onMount } from 'svelte';
  import TabItem from './TabItem.svelte';
  import { createTabsRegistry, TABS_REGISTRY_CTX_KEY } from './tabsRegistry';

  /** @type {(import('./tabsRegistry').TabsRegistryItem)[]} */
  export let values = [];
  /** @type {string | null} */
  export let defaultValue = null;
  /** @type {string | null} */
  export let groupId = null;

  const registry = createTabsRegistry([...values], {
    defaultValue,
    groupId,
    onMount,
    onDestroy,
  });

  setContext(TABS_REGISTRY_CTX_KEY, registry);
</script>

<div class="tabs">
  <ul class="tabs__list" role="tablist" aria-orientation="horizontal">
    {#each values.filter(isString) as value (value)}
      <TabItem {value} />
    {/each}

    <slot name="tablist" />
  </ul>

  <div class="tabs__panels">
    <slot />
  </div>
</div>

<style>
  .tabs {
    width: 100%;
    border: var(--vbk--menu-border);
    margin: 2rem 0;
  }

  .tabs__list {
    display: flex;
    align-items: center;
    width: 100%;
    list-style: none;
    padding: 0.2rem;
    margin: 0;
    overflow-x: auto;
    background-color: var(--vbk--color-bg-200);
  }

  .tabs__panels {
    padding: 1.15rem;
  }
</style>
