<script>
  import BackArrowIcon from ':virtual/vitebook/icons/back-arrow?raw';
  import { currentRoute } from '@vitebook/client';
  import { defaultThemeLocaleOptions } from '../../../shared';
  import { darkMode } from '../../stores/darkMode';
  import { isLargeScreen } from '../../stores/isLargeScreen';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import { hasNavbarItems } from '../navbar/hasNavbarItems';
  import NavbarTitle from '../navbar/NavbarTitle.svelte';
  import ThemeSwitch from '../ThemeSwitch.svelte';
  import DiscordLink from '../links/DiscordLink.svelte';
  import RepoLink from '../links/RepoLink.svelte';
  import TwitterLink from '../links/TwitterLink.svelte';
  import { hasSidebarItems } from './hasSidebarItems';
  import { multiSidebarStyleConfig } from './multiSidebarStyleConfig';
  import SidebarButton from './SidebarButton.svelte';
  import { sidebarItems } from './sidebarItems';
  import SidebarTree from './SidebarTree.svelte';

  export let open = false;

  let sidebarBodyRef;
  let isMainMenuShowing = false;

  $: backToMainMenuText =
    $localizedThemeConfig.sidebar?.backToMainMenuText ??
    defaultThemeLocaleOptions.sidebar.backToMainMenuText;

  $: iconColors =
    $multiSidebarStyleConfig.iconColors ??
    $localizedThemeConfig.sidebar?.iconColors;

  $: hasMainMenuItems = !$isLargeScreen ? $hasNavbarItems : false;

  $: isMainMenuShowing =
    (!open && !$hasSidebarItems) || (!$hasSidebarItems && hasMainMenuItems);

  $: forceOpen = $isLargeScreen && $hasSidebarItems;

  // Close sidebar on route change if not forced open.
  $: if ($currentRoute && !forceOpen) open = false;

  // Hide main menu once enter large screen, otherwise hide sidebar on smaller devices.
  $: if ($isLargeScreen) {
    isMainMenuShowing = false;
  } else {
    open = false;
  }

  // If large screen and no sidebar items hide it.
  $: if ($isLargeScreen && !$hasSidebarItems) {
    open = false;
  }

  // force open.
  $: if (!open && forceOpen) {
    open = true;
  }

  function onShowMainMenu() {
    isMainMenuShowing = true;
  }

  $: hasHeader = !$isLargeScreen || $localizedThemeConfig.navbar === false;
</script>

<aside
  class="sidebar"
  class:dark={$darkMode}
  class:open
  class:icon-colors={iconColors}
  aria-hidden={!open}
>
  <slot name="start" />

  {#if hasHeader}
    <div class="sidebar__header">
      <div class="sidebar__header-wrapper">
        <NavbarTitle />
        <div style="flex-grow: 1; margin-left: 2.5rem;" />
        <TwitterLink />
        <DiscordLink />
        <RepoLink />
        <ThemeSwitch />
      </div>
    </div>
  {/if}

  <div class="sidebar__body" bind:this={sidebarBodyRef}>
    {#if hasMainMenuItems && !$isLargeScreen && !isMainMenuShowing}
      <SidebarButton
        class="sidebar__back-button"
        aria-hidden={isMainMenuShowing}
        on:pointerdown={onShowMainMenu}
        on:keydown={(e) => e.key === 'Enter' && onShowMainMenu()}
      >
        <span class="sidebar__back-button__arrow">
          {@html BackArrowIcon}
        </span>
        {backToMainMenuText}
      </SidebarButton>
    {/if}

    {#if hasMainMenuItems}
      <div class="sidebar__main-menu" aria-hidden={!isMainMenuShowing}>
        {#await import('../navbar/NavLinks.svelte') then NavLinks}
          <svelte:component
            this={NavLinks.default}
            active={isMainMenuShowing}
          />
        {/await}
      </div>
    {/if}

    {#if $hasSidebarItems}
      <ul class="sidebar__current-menu" aria-hidden={isMainMenuShowing}>
        <SidebarTree items={$sidebarItems} />
      </ul>
    {/if}
  </div>

  <slot name="end" />
</aside>

<style>
  .sidebar {
    --vbk--nav-item-color: var(--vbk--sidebar-item-color);
    --vbk--nav-item-bg-color: var(--vbk--sidebar-item-bg-color);
    --vbk--nav-item-hover-color: var(--vbk--sidebar-item-hover-color);
    --vbk--nav-item-hover-bg-color: var(--vbk--sidebar-item-hover-bg-color);
    --vbk--nav-link-active-bg-color: transparent;

    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    flex: 0 0 auto;
    z-index: var(--vbk--sidebar-z-index);
    min-width: 80vw;
    background-color: var(--vbk--sidebar-bg-color);
    overflow-y: auto;
    border: var(--vbk--sidebar-border);
    transform: translateX(-100%) translateZ(0);
    transition: transform 250ms ease-in;
    will-change: transform;
    box-shadow: var(--vbk--elevation-medium);
  }

  .sidebar.open {
    transform: translateX(0) translateZ(0);
  }

  .sidebar__header {
    position: sticky;
    top: 0;
    left: 0;
    padding-top: 0.25rem;
    background-color: var(--vbk--sidebar-bg-color);
  }

  .sidebar__header-wrapper {
    display: flex;
    padding: 1rem;
  }

  .sidebar__back-button__arrow {
    margin-right: 0.25rem;
  }

  .sidebar__body {
    flex: 1 0 0;
    padding: 0 1rem;
    padding-bottom: 2.5rem;
    overflow-x: hidden;
  }

  .sidebar__main-menu {
    display: none;
  }

  .sidebar__main-menu[aria-hidden='false'] {
    display: block;
  }

  .sidebar__current-menu {
    padding: 0;
    margin: 0;
    margin-top: 0.75rem;
  }

  .sidebar__current-menu[aria-hidden='true'] {
    display: none;
  }

  @media (min-width: 992px) {
    .sidebar {
      position: sticky;
      width: auto;
      min-width: var(--vbk--sidebar-min-width);
      max-height: 100vh;
      opacity: 1;
      z-index: 1;
      transition: unset;
      padding-top: var(--vbk--navbar-height);
      box-shadow: unset;
    }

    .sidebar.open {
      border-right: 0.125rem solid var(--vbk--color-gray-200);
    }

    .sidebar.open.dark {
      border-color: var(--vbk--color-gray-500);
    }

    .sidebar:not(.sidebar.open) {
      width: 0;
      min-width: 0;
      opacity: 0;
      visibility: hidden;
    }
  }
</style>
