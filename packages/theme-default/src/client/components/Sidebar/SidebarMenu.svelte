<script>
  import FolderClosedIcon from ':virtual/vitebook/icons/sidebar-folder-closed?raw';
  import FolderOpenIcon from ':virtual/vitebook/icons/sidebar-folder-open?raw';
  import { tick } from 'svelte';
  import { afterUpdate, onMount } from 'svelte';
  import SidebarButton from './SidebarButton.svelte';

  export let item;
  export let depth;

  let sidebarItemRef;

  let active = false;
  let open = false;

  function checkHasActiveItem() {
    active = !!sidebarItemRef?.querySelector('a.active');
  }

  onMount(() => {
    tick()
      .then(tick)
      .then(() => {
        checkHasActiveItem();
        open = active;
      });
  });

  afterUpdate(() => {
    window.requestAnimationFrame(checkHasActiveItem);
  });

  function onToggle() {
    open = !open;
  }
</script>

<li
  class="sidebar-item with-menu"
  class:active
  class:open
  bind:this={sidebarItemRef}
>
  <SidebarButton
    id={`sidebar-menu-button-${depth}`}
    aria-controls={`sidebar-menu-${depth}`}
    aria-haspopup="true"
    class="sidebar-item__menu-button"
    on:pointerdown={onToggle}
    on:keydown={(e) => e.key === 'Enter' && onToggle()}
  >
    <span class="sidebar-item__menu-button__icon" class:active>
      {#if open}
        {@html FolderOpenIcon}
      {:else}
        {@html FolderClosedIcon}
      {/if}
    </span>
    {item.text}
  </SidebarButton>

  <ul
    id={`sidebar-menu-${depth}`}
    class="sidebar-item__menu"
    aria-labelledby={`sidebar-menu-button-${depth}`}
    aria-expanded={open}
  >
    <slot />
  </ul>
</li>

<style>
  .sidebar-item {
    display: block;
    min-width: var(--vbk--sidebar-item-min-width);
    border-radius: var(--vbk--sidebar-item-border-radius);
    white-space: nowrap;
  }

  .sidebar-item__menu-button__icon {
    margin-right: 0.5rem;
  }

  .sidebar-item__menu-button__icon.active {
    color: var(--vbk--color-primary);
  }

  .sidebar-item__menu {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .sidebar-item__menu {
    display: none !important;
    margin-left: 1rem !important;
  }

  .sidebar-item.open > .sidebar-item__menu {
    display: block !important;
  }
</style>
