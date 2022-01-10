<script>
  import MenuCaretIcon from ':virtual/vitebook/icons/menu-caret?raw';

  import {
    activeVariant,
    currentRoute,
    toTitleCase,
    variants,
  } from '@vitebook/client';
  import { tick } from 'svelte';
  import { darkMode } from '../stores/darkMode';

  let buttonRef;
  let variantsRef;

  let open = false;

  let showingTooltipFor;
  let showingTooltipForTimer;

  $: variations = Object.values($variants);

  // `/components/button.html` => `Components/Button`
  $: variantPath = $currentRoute.decodedPath
    .split('/')
    .slice(1)
    .map((s) => s.replace('.html', ''))
    .map(toTitleCase);

  // If `/Components/Button/Button` => `Components/Button`
  $: if (
    variantPath[variantPath.length - 1] === variantPath[variantPath.length - 2]
  ) {
    variantPath.splice(variantPath.length - 1, 1);
  }

  function toggleMenu() {
    open = !open;
  }

  function setActiveVariant(variant) {
    variants.setActive(variant.id);
    toggleMenu();
  }

  // TODO: poor man's accessbility, fix later.
  function onKeyDown(e) {
    if (!open) return;

    if (e.key === 'Esc' || e.key === 'Escape') {
      open = false;
      buttonRef?.focus();
    } else if (e.key === 'Tab') {
      tick().then(() => {
        window.requestAnimationFrame(() => {
          if (!variantsRef?.contains(document.activeElement)) {
            open = false;
          }
        });
      });
    }
  }
</script>

{#if variations.length > 0}
  <div
    class="variants"
    class:dark={$darkMode}
    on:mouseenter={() => {
      open = true;
    }}
    on:mouseleave={() => {
      open = false;
    }}
    on:keydown={onKeyDown}
    bind:this={variantsRef}
  >
    <button
      id="variants-menu-button"
      class="variants__button"
      aria-label="component variants menu"
      aria-controls="variants-menu"
      aria-haspopup="true"
      on:pointerdown={toggleMenu}
      on:keydown={(e) => e.key === 'Enter' && toggleMenu()}
      bind:this={buttonRef}
    >
      {#each variantPath as segment}
        <span class="variants__button__segment">{segment}</span>
        <span class="variants__button__separator">/</span>
      {/each}
      <span class="variants__button__variant">
        {$activeVariant?.name}
      </span>
      <div class="variants__button__caret">
        {@html MenuCaretIcon.replace(/stroke-width="2"/, 'stroke-width="2.5"')}
      </div>
    </button>
    <ul
      id="variants-menu"
      class="variants__menu"
      aria-labelledby="variants-menu-button"
      aria-expanded={open ? 'true' : 'false'}
    >
      {#each variations as variant (variant.id)}
        <li
          class="variants__menu-item"
          class:active={variant.id === $activeVariant?.id}
        >
          <button
            class="variants__menu-item__button"
            aria-describedby={`variant-tooltip-${variant.name}`}
            on:pointerenter={() => {
              showingTooltipForTimer = setTimeout(() => {
                showingTooltipFor = variant;
              }, 1000);
            }}
            on:pointerleave={() => {
              window.clearTimeout(showingTooltipForTimer);
              showingTooltipFor = undefined;
            }}
            on:pointerdown={() => setActiveVariant(variant)}
            on:keydown={(e) => e.key === 'Enter' && setActiveVariant(variant)}
          >
            {variant.name}
          </button>

          {#if variant.description}
            <div
              id={`variant-tooltip-${variant.name}`}
              class="variants__menu-item__tooltip"
              role="tooltip"
              aria-hidden={showingTooltipFor !== variant ? 'true' : undefined}
            >
              {variant.description}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .variants {
    position: relative;
  }

  .variants__button {
    display: flex;
    align-items: center;
    padding: 0.375rem 1rem;
  }

  .variants__button__segment {
    opacity: 0.9;
  }

  .variants__button__separator {
    opacity: 0.9;
    margin: 0 0.375rem;
  }

  .variants__button__variant {
    font-weight: 500;
  }

  .variants__button__caret {
    margin-left: 0.25rem;
    font-size: 13px;
    transform: translateY(0.5px);
  }

  .variants__menu {
    display: block;
    position: absolute;
    top: 100%;
    right: 1rem;
    padding: 0.8rem;
    padding-bottom: 1rem;
    margin: 0;
    opacity: 0;
    list-style: none;
    visibility: hidden;
    z-index: calc(var(--vbk--navbar-z-index) + 1);
    border-radius: 0.15rem;
    box-shadow: var(--vbk--elevation-medium);
    min-width: 10rem;
    border: var(--vbk--menu-border);
    background-color: var(--vbk--menu-bg-color);
    transition: var(--vbk--menu-transition);
  }

  .variants__menu[aria-expanded='true'] {
    opacity: 1;
    visibility: visible;
  }

  .variants__menu-item {
    position: relative;
    padding: 0.25rem 0.875rem;
  }

  .variants__menu-item.active {
    color: var(--vbk--color-primary);
  }

  .variants__menu-item__button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
  }

  .variants__menu-item.active .variants__menu-item__button {
    font-weight: 500;
  }

  .variants__menu-item__tooltip {
    display: none;
    align-items: center;
    justify-content: center;
    position: absolute;
    padding: 0 0.5rem;
    top: 0.5rem;
    left: calc(100% + 0.25rem);
    min-width: 150px;
    max-width: 200px;
    font-size: 0.75rem;
    color: var(--vbk--color-gray-100);
    background-color: var(--vbk--color-gray-500);
    z-index: calc(var(--vbk--navbar-z-index) + 2);
  }

  .variants.dark .variants__menu-item__tooltip {
    color: var(--vbk--color-gray-600);
    background-color: var(--vbk--color-gray-400);
  }

  .variants__menu-item__tooltip[aria-hidden] {
    opacity: 0;
    visibility: hidden;
  }

  @media (hover: hover) {
    .variants__menu-item:hover {
      cursor: pointer;
      background-color: var(--vbk--menu-item-hover-bg-color);
    }

    .variants__menu-item:not(.active):hover {
      color: var(--vbk--menu-item-hover-color);
    }
  }

  @media (min-width: 576px) {
    .variants__menu-item__tooltip {
      display: flex;
    }
  }
</style>
