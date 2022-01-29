<script>
  import MenuCaretIcon from ':virtual/vitebook/icons/menu-caret?raw';
  import FolderClosedIcon from ':virtual/vitebook/icons/sidebar-folder-closed?raw';
  import FolderOpenIcon from ':virtual/vitebook/icons/sidebar-folder-open?raw';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import { tick } from 'svelte';
  import { afterUpdate, onMount } from 'svelte';
  import SidebarButton from './SidebarButton.svelte';
  import { multiSidebarStyleConfig } from './multiSidebarStyleConfig';

  export let item;
  export let depth;

  let sidebarItemRef;

  let active = false;
  let open = false;

  $: sidebarStyle =
    $multiSidebarStyleConfig.style ?? $localizedThemeConfig.sidebar?.style;
  $: hasExplorerStyle = sidebarStyle === 'explorer';
  $: hasDocsStyle = sidebarStyle === 'docs';
  $: isCategory =
    ($localizedThemeConfig.sidebar?.categories ?? false) && depth === 0;

  $: if (isCategory) {
    active = true;
    open = true;
  }

  function checkHasActiveItem() {
    active = !!sidebarItemRef?.querySelector('a.active');
  }

  onMount(() => {
    if (!isCategory) {
      tick()
        .then(tick)
        .then(() => {
          checkHasActiveItem();
          open = active;
        });
    }
  });

  afterUpdate(() => {
    if (!isCategory) {
      window.requestAnimationFrame(checkHasActiveItem);
    }
  });

  function onToggle() {
    if (isCategory) return;
    open = !open;
  }
</script>

<li
  class="sidebar-item with-menu"
  class:active
  class:open
  class:category={isCategory}
  class:style-docs={hasDocsStyle}
  class:style-explorer={hasExplorerStyle}
  bind:this={sidebarItemRef}
>
  <span>
    <SidebarButton
      id={`sidebar-menu-button-${depth}`}
      aria-controls={`sidebar-menu-${depth}`}
      aria-haspopup="true"
      class="sidebar-item__menu-button"
      tabindex={isCategory ? -1 : undefined}
      on:pointerdown={onToggle}
      on:keydown={(e) => e.key === 'Enter' && onToggle()}
    >
      {#if hasExplorerStyle && !isCategory}
        <span class="sidebar-item__menu-button__icon" class:active>
          {#if open}
            {@html FolderOpenIcon}
          {:else}
            {@html FolderClosedIcon}
          {/if}
        </span>
      {/if}
      <span
        class="sidebar-item__menu-button__text"
        class:category={isCategory}
        class:style-docs={hasDocsStyle}
        class:style-explorer={hasExplorerStyle}
      >
        {item.text}
      </span>
      <span class="sidebar-item__menu-button__caret" class:active class:open>
        {#if hasDocsStyle && !isCategory}
          {@html MenuCaretIcon}
        {/if}
      </span>
    </SidebarButton>
  </span>

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

  .sidebar-item.category > span {
    --vbk--sidebar-item-cursor: default;
    --vbk--sidebar-item-hover-bg-color: transparent;
    --vbk--sidebar-item-padding: 0;
    --vbk--sidebar-item-font-size: 1.1rem;

    display: inline-block;
    margin: 0.75rem 0;
    margin-left: 0.125rem;
    width: 100%;
  }

  .sidebar-item__menu-button__text.style-docs {
    font-weight: 500;
  }

  .sidebar-item__menu-button__text.category {
    font-weight: bold;
  }

  .sidebar-item__menu-button__icon {
    margin-right: 0.5rem;
    color: var(--vbk--color-primary);
  }

  .sidebar-item__menu-button__caret {
    margin-left: auto;
    transform: rotate(270deg) translateX(-0.05rem) translateZ(0);
    transform-origin: center;
    transition: transform 150ms ease-out;
  }

  .sidebar-item__menu-button__caret.open {
    transform: translateZ(0);
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
    margin-left: 0.5rem !important;
  }

  .sidebar-item.open > .sidebar-item__menu {
    display: block !important;
  }
</style>
