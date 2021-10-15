<script>
  import MenuCaretIcon from ':virtual/vitebook/icons/menu-caret?raw';
  import { currentRoute, inBrowser } from '@vitebook/client';
  import { onMount } from 'svelte';
  import { afterUpdate } from 'svelte';
  import { tick } from 'svelte';
  import { languageLinks } from '../../stores/languageLinks';
  import { useMediaQuery } from '../../stores/useMediaQuery';
  import NavItemLink from './NavItemLink.svelte';

  export let item;

  let navItemRef;
  let menuButtonRef;

  let isMenuOpen = false;
  let isMenuActive = false;

  const isLargeScreen = useMediaQuery('(min-width: 992px)');

  $: isLanguagesGroup = item.text === $languageLinks?.text;

  $: menuId = `nav-menu-${item.text.replace(/\s/g, '-').toLowerCase()}`;
  $: menuButtonId = `nav-menu-button-${item.text
    .replace(/\s/g, '-')
    .toLowerCase()}`;

  $: if ($currentRoute && inBrowser) {
    if ($isLargeScreen) {
      isMenuOpen = false;
    } else if (navItemRef) {
      tick().then(() => {
        if (!navItemRef?.querySelector('a.active')) {
          isMenuOpen = false;
        }
      });
    }
  }

  onMount(() => {
    checkHasActiveItem();
    if (!$isLargeScreen && !isLanguagesGroup) {
      isMenuOpen = isMenuActive;
    }
  });

  afterUpdate(() => {
    tick().then(() => {
      checkHasActiveItem();
    });
  });

  function checkHasActiveItem() {
    if (!isLanguagesGroup) {
      isMenuActive = !!navItemRef?.querySelector('a.active');
    }
  }

  function onToggle() {
    isMenuOpen = !isMenuOpen;
  }

  function onMenuPointerLeave() {
    if ($isLargeScreen) {
      isMenuOpen = false;
    }
  }

  // TODO: poor man's accessbility, fix later.
  function onKeyDown(e) {
    if (!isMenuOpen) return;

    if (e.key === 'Esc' || e.key === 'Escape') {
      isMenuOpen = false;
      menuButtonRef?.focus();
    } else if (e.key === 'Tab') {
      tick().then(() => {
        if (!navItemRef?.contains(document.activeElement)) {
          isMenuOpen = false;
        }
      });
    }
  }
</script>

<div
  class="nav-item with-menu"
  on:keydown={onKeyDown}
  class:open={isMenuOpen}
  class:active={isMenuActive}
  bind:this={navItemRef}
>
  <button
    id={menuButtonId}
    class="nav-item__menu-button"
    aria-label={item.ariaLabel}
    aria-controls={menuId}
    aria-haspopup="true"
    on:pointerdown={onToggle}
    on:keydown={(e) => e.key === 'Enter' && onToggle()}
    bind:this={menuButtonRef}
  >
    <span class="nav-item__menu-button__text">{item.text}</span>
    <div class="nav-item__menu-button__caret">
      {@html MenuCaretIcon}
    </div>
  </button>

  <ul
    id={menuId}
    class="nav-item__menu"
    aria-labelledby={menuButtonId}
    aria-expanded={isMenuOpen}
    on:pointerleave={onMenuPointerLeave}
  >
    {#each item.menu as menuItem (menuItem.text)}
      <li class="nav-item__menu-item">
        <NavItemLink item={menuItem} />
      </li>
    {/each}
  </ul>
</div>

<style>
  /** No mobile styles because a nav item menu is a sidebar group <992px. **/

  .nav-item__menu-button__caret {
    padding-left: 0.12rem;
    transform: rotate(270deg) translateX(-0.25rem) translateZ(0);
    transform-origin: center;
  }

  .nav-item.open .nav-item__menu-button__caret {
    transform: translateY(0.1rem) translateZ(0);
  }

  @media (hover: hover) and (min-width: 992px) {
    .nav-item:hover {
      color: var(--vbk--nav-item-hover-color);
      background-color: var(--vbk--nav-item-hover-bg-color);
    }
  }

  @media (hover: hover) {
    .nav-item__menu-item:hover {
      color: var(--vbk--menu-item-hover-color);
      background-color: var(--vbk--menu-item-hover-bg-color);
    }

    :global(.nav-item__menu-item .nav-link:not(.active) > .nav-link__text) {
      border-bottom: 0 !important;
    }

    .nav-item.with-menu:hover .nav-item__menu {
      opacity: 1;
      visibility: visible;
    }
  }

  @media (min-width: 992px) {
    .nav-item {
      color: var(--vbk--nav-item-color);
      background-color: var(--vbk--nav-item-bg-color);
    }

    .nav-item > button {
      display: flex;
      align-items: center;
      font-size: 1rem;
      border: 0;
      font-weight: 500;
      line-height: 1.4;
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0;
      color: var(--vbk--nav-item-color);
      white-space: nowrap;
      text-decoration: none;
      width: 100%;
      cursor: pointer;
      text-align: left;
      background-color: transparent;
    }

    .nav-item__menu-button__caret,
    .nav-item.open .nav-item__menu-button__caret {
      transform: translateY(0) translateZ(0);
    }

    .nav-item.with-menu {
      position: relative;
      cursor: pointer;
      overflow: visible;
      width: 100%;
    }

    .nav-item__menu {
      display: block;
      position: absolute;
      top: 100%;
      right: 1rem;
      padding: 0.8rem;
      padding-bottom: 1rem;
      margin: 0;
      opacity: 0;
      visibility: hidden;
      z-index: calc(var(--vbk--navbar-z-index) + 1);
      border-radius: 0.15rem;
      box-shadow: var(--vbk--elevation-medium);
      min-width: 10rem;
      border: var(--vbk--menu-border);
      background-color: var(--vbk--menu-bg-color);
      transition: var(--vbk--menu-transition);
    }

    .nav-item.open .nav-item__menu {
      opacity: 1;
      visibility: visible;
    }
  }
</style>
