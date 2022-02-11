<script>
  import { tick } from 'svelte';
  import { darkMode } from '../../stores/darkMode';
  import { isLargeScreen } from '../../stores/isLargeScreen';
  import {
    addons,
    getAddonPortalId,
    getAddonSSRMarker,
  } from '@vitebook/client/addons';
  import { onMount } from 'svelte';
  import { currentRoute } from '@vitebook/client';
  import { get } from 'svelte/store';

  let contentRef = null;
  let initialClientY = 0;
  let prevContentYTranslation = 50;
  let contentYTranslation = 100;
  let isDraggingContent = false;
  let bodyMoveRafId;
  let hasContentReachedTop = false;

  const iconCache = new Map();

  let mounted = false;
  onMount(() => {
    if (hasActiveAddon) contentYTranslation = 50;

    tick().then(() => {
      addons.ready.set(true);
      mounted = true;
    });

    return () => {
      mounted = false;
      addons.ready.set(false);
      iconCache.clear();
    };
  });

  async function loadIcon(addon) {
    if (addon?.icon) return { default: addon.icon };

    if (iconCache.has(addon?.id)) {
      return iconCache.get(addon.id);
    }

    let Icon;

    // Try to infer some icon
    switch (addon?.id) {
      case 'controls':
        Icon = await import('/:virtual/vitebook/icons/addon-controls?raw');
        break;
      case 'events':
        Icon = await import('/:virtual/vitebook/icons/addon-events?raw');
        break;
      default:
        Icon = await import('/:virtual/vitebook/icons/addon-unknown?raw');
    }

    iconCache.set(addon?.id, Icon);
    return Icon;
  }

  function getTabButtonId({ title }) {
    return `vbk-addons-tab-button-${title.toLowerCase()}`;
  }

  function getTabPanelId({ title }) {
    return `vbk-addons-tab-panel-${title.toLowerCase()}`;
  }

  function updateAddonStorage(addon) {
    window?.localStorage.setItem('@vitebook/addon', addon?.id ?? '');
  }

  function onSelectAddon(addon) {
    if ($addons[addon?.id]?.active) {
      addons.setActive(null);
      contentYTranslation = 100;
      updateAddonStorage(null);
      return;
    }

    addons.setActive(addon);
    updateAddonStorage(addon);

    if (contentYTranslation === 100) {
      contentYTranslation = prevContentYTranslation;
    }
  }

  function startDraggingContent(event) {
    event.stopPropagation();

    const contentRect = contentRef.getBoundingClientRect();
    if (
      contentRef.scrollHeight > contentRef.clientHeight &&
      (hasContentReachedTop ||
        (contentRect.top === 0 && contentRef.scrollTop > 0))
    ) {
      hasContentReachedTop = false;
      return;
    }

    initialClientY = event.clientY;
    isDraggingContent = true;
  }

  function stopDraggingContent() {
    if (isDraggingContent) {
      isDraggingContent = false;

      if (!$isLargeScreen) {
        window.requestAnimationFrame(() => {
          const thresholds = [0, 50, 100];

          const threshold = thresholds.sort((a, b) => {
            return (
              Math.abs(contentYTranslation - a) -
              Math.abs(contentYTranslation - b)
            );
          })[0];

          if (threshold === 100) {
            addons.setActive(null);
            updateAddonStorage(null);
            prevContentYTranslation = 50;
          } else {
            prevContentYTranslation = threshold;
          }

          contentYTranslation = threshold;
          hasContentReachedTop = threshold === 0;
        });
      }
    }
  }

  function handleBodyPointerMove(event) {
    if ($isLargeScreen || !isDraggingContent) return;

    event.preventDefault();

    if (bodyMoveRafId) return;

    bodyMoveRafId = window.requestAnimationFrame(() => {
      const appBar = document.body.clientHeight - window.innerHeight;
      const contentRect = contentRef.getBoundingClientRect();

      const translateY = Math.max(
        0,
        Math.min(
          100,
          ((contentRect.top + (event.clientY - initialClientY) * 1.5) /
            (window.innerHeight + appBar)) *
            100,
        ),
      );

      contentYTranslation = translateY;
      bodyMoveRafId = undefined;
    });
  }

  $: activeAddon = Object.values($addons).find((addon) => addon.active);
  $: hasActiveAddon = !!activeAddon;

  $: if ($currentRoute && mounted) {
    tick().then(() => {
      const prevActiveAddonId = window?.localStorage.getItem('@vitebook/addon');
      const addon = Object.values(get(addons)).find(
        (a) => a.id === prevActiveAddonId,
      );
      updateAddonStorage(addon);
      addons.setActive(addon ?? null);
    });
  }
</script>

<svelte:body
  on:pointermove={handleBodyPointerMove}
  on:pointerup={stopDraggingContent}
  on:pointerdown={() => !$isLargeScreen && onSelectAddon(null)} />

<aside
  class="addons"
  class:dark={$darkMode}
  class:content-active={hasActiveAddon}
  on:touchmove|nonpassive={(e) => isDraggingContent && e.preventDefault()}
>
  <slot name="start" />

  <div
    class="addons__content"
    class:active={hasActiveAddon}
    style={`transform: translate3d(0, ${
      hasActiveAddon ? `${contentYTranslation}%` : '100%'
    }, 0);`}
    on:pointerdown={startDraggingContent}
    bind:this={contentRef}
  >
    <div class="addons__header">
      <div class="addons__drag-indicator" />

      <h1 class="addons__header__title">
        {activeAddon?.title}
      </h1>
    </div>

    <main class="addons__body">
      <div class="addons__panels">
        {#each Object.values($addons) as addon (addon.id)}
          <div
            id={getTabPanelId(addon)}
            class="addons__panel"
            role="tabpanel"
            aria-hidden={!addon.active}
            aria-labelledby={getTabButtonId(addon)}
          >
            <div id={getAddonPortalId(addon)}>
              {#if import.meta.env.SSR}
                {@html getAddonSSRMarker(addon)}
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </main>
  </div>

  <ul class="addons__tabs" role="tablist" on:pointerdown|stopPropagation>
    {#each Object.values($addons) as addon (addon.id)}
      <li
        id={getTabButtonId(addon)}
        class="addons__tab"
        role="tab"
        tabindex="0"
        class:selected={addon.active}
        aria-selected={addon.active ? 'true' : 'false'}
        aria-controls={getTabPanelId(addon)}
        aria-label={addon.title}
        on:pointerdown={() => onSelectAddon(addon)}
        on:keydown={(e) => e.key === 'Enter' && onSelectAddon(addon)}
      >
        {#await loadIcon(addon) then Icon}
          {@html Icon?.default}
        {/await}

        <div class="addons__tab__tooltip">{addon.title}</div>
      </li>
    {/each}
  </ul>

  <slot name="end" />
</aside>

<style>
  .addons__tabs {
    display: flex;
    flex-direction: row;
    list-style: none;
    margin: 0;
    padding: 0;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: calc(var(--vbk--scrim-z-index) - 1);
    background-color: var(--vbk--color-gray-100);
    border-top: 0.125rem solid var(--vbk--color-gray-200);
  }

  .addons.dark .addons__tabs {
    background-color: var(--vbk--color-bg-400);
    border-color: var(--vbk--color-gray-500);
  }

  .addons__tab {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    padding: 1rem 0.75rem;
    font-size: 1.2rem;
    margin: 0;
    user-select: none;
  }

  .addons__tab.selected {
    color: var(--vbk--color-primary);
    background-color: var(--vbk--sidebar-item-active-bg-color);
  }

  .addons__tab:before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    user-select: none;
  }

  .addons__tab.selected:before {
    border-top: 0.2rem solid var(--vbk--color-primary);
  }

  .addons__panel {
    padding: 1rem 1.25rem;
  }

  .addons__panel[aria-hidden='true'] {
    display: none;
  }

  .addons__panel > div {
    display: flex;
    flex-direction: column;
  }

  .addons__tab__tooltip {
    display: none;
  }

  .addons__header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: grabbing;
  }

  .addons__drag-indicator {
    margin-top: 1rem;
    width: 3rem;
    height: 0.25rem;
    user-select: none;
    background-color: var(--vbk--color-gray-200);
  }

  .addons.dark .addons__drag-indicator {
    background-color: var(--vbk--color-gray-500);
  }

  .addons__header__title {
    line-height: 1.75rem;
    font-size: 1.5rem;
    width: auto;
    padding: 0;
    margin: 0;
    margin-top: 1.5rem;
    user-select: none;
  }

  .addons__content {
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: calc(var(--vbk--scrim-z-index) - 2);
    position: fixed;
    transition: transform 0.1s ease;
    background-color: var(--vbk--color-bg-100);
    overflow-y: auto;
  }

  .addons__content:not(.active) .addons__header__title {
    opacity: 0;
  }

  .addons.dark .addons__content {
    background-color: var(--vbk--color-bg-400);
  }

  .addons__body {
    margin-top: 1.5rem;
  }

  .addons__panel {
    display: flex;
    flex-direction: column;
  }

  @media (hover: hover) and (pointer: fine) {
    .addons__tab:not(.selected):hover {
      outline: 0;
      color: var(--vbk--toggle-hover-color);
      background-color: var(--vbk--toggle-hover-bg-color);
    }

    .addons__tab:hover > .addons__tab__tooltip {
      opacity: 1;
      visibility: visible;
      transition-delay: 0.75s;
    }
  }

  @media (min-width: 992px) {
    .addons {
      position: sticky;
      top: 0;
      right: 0;
      width: auto;
      max-height: 100vh;
      opacity: 1;
      z-index: 1;
      transition: margin 0.15s ease-in;
      padding-top: var(--vbk--navbar-height);
    }

    .addons__header {
      display: none;
    }

    .addons__content {
      position: absolute;
      flex: 1;
      top: var(--vbk--navbar-height);
      min-width: 20rem;
      right: 0;
      height: 100%;
      transform: translateX(2%) translateY(0%) !important;
    }

    .addons.content-active {
      margin-left: 20rem;
    }

    .addons__content.active {
      transform: translateX(-100%) translateY(0%) !important;
    }

    .addons__body {
      margin-top: 0;
    }

    .addons__tabs {
      width: auto;
      position: relative;
      flex-direction: column;
      border-top: 0;
      height: 100%;
    }

    .addons__tabs:before {
      content: '';
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      border-left: 0.2rem solid var(--vbk--color-gray-200);
    }

    .addons.dark .addons__tabs:before {
      border-color: var(--vbk--color-gray-500);
    }

    .addons__tab {
      flex: 0;
    }

    .addons__tab.selected:before {
      border-top: 0;
      border-left: 0.2rem solid var(--vbk--color-primary);
    }

    .addons__tab__tooltip {
      display: flex;
      opacity: 0;
      visibility: hidden;
      align-items: center;
      justify-content: flex-start;
      position: absolute;
      padding: 0 0.5rem;
      bottom: 1rem;
      right: calc(100% + 0.375rem);
      font-size: 0.75rem;
      color: var(--vbk--color-gray-100);
      background-color: var(--vbk--color-gray-500);
      z-index: 10;
      transition: opacity 0.15s ease-in;
      transition-delay: 0.75s;
      user-select: none;
    }

    .addons.dark .addons__tab__tooltip {
      color: var(--vbk--color-gray-600);
      background-color: var(--vbk--color-gray-400);
    }
  }

  @media (min-width: 1400px) {
    .addons__content {
      min-width: 28rem;
    }

    .addons.content-active {
      margin-left: 28rem;
    }
  }
</style>
