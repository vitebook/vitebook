<script>
  import { currentPage } from '@vitebook/client';

  import { onMount } from 'svelte';

  import { isMarkdownFloatingTocEnabled } from '../components/Markdown/isMarkdownFloatingTocEnabled';
  import NavbarTitle from '../components/Navbar/NavbarTitle.svelte';
  import Scrim from '../components/Scrim.svelte';
  import { hasSidebarItems } from '../components/Sidebar/hasSidebarItems';
  import Sidebar from '../components/Sidebar/Sidebar.svelte';
  import SidebarToggle from '../components/Sidebar/SidebarToggle.svelte';
  import ThemeSwitch from '../components/ThemeSwitch.svelte';
  import { darkMode, useDarkMode } from '../stores/darkMode';
  import { isLargeScreen } from '../stores/isLargeScreen';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';
  import Page from './Page.svelte';

  useDarkMode();

  let isSidebarOpen = false;
  let hasMounted = false;

  $: noNavbar = $localizedThemeConfig.navbar === false;

  $: isMarkdownPage = $currentPage?.type?.endsWith('md');

  onMount(() => {
    let scrollbarWidth = window.innerWidth - document.body.clientWidth + 'px';
    document.documentElement.style.setProperty(
      '--vbk--scrollbar-width',
      scrollbarWidth
    );

    hasMounted = true;
  });

  $: if (hasMounted) {
    const htmlEl = window?.document.querySelector('html');
    htmlEl?.setAttribute('data-vbk-sidebar', isSidebarOpen ? 'open' : 'closed');
  }

  function onToggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<div
  class="theme"
  class:no-navbar={noNavbar}
  class:dark={$darkMode}
  class:sidebar-open={isSidebarOpen}
>
  <slot name="navbar">
    {#if $localizedThemeConfig.navbar !== false}
      {#await import('../components/Navbar/Navbar.svelte') then Navbar}
        <svelte:component this={Navbar.default}>
          <svelte:fragment slot="start">
            <slot name="navbar-start" />
            <span class="navbar__sidebar-toggle">
              <SidebarToggle on:toggle={onToggleSidebar} />
            </span>
          </svelte:fragment>

          <svelte:fragment slot="end">
            <slot name="navbar-end">
              {#if $isLargeScreen}
                <ThemeSwitch class="navbar__theme-switch" />
              {/if}

              {#if false}
                <!-- pointless element to silence unused CSS warnings. -->
                <span
                  class="navbar__theme-switch"
                  style="display: none;"
                  hidden
                />
              {/if}
            </slot>
          </svelte:fragment>
        </svelte:component>
      {/await}
    {:else}
      <div class="navbar-fallback" class:no-sidebar-toggle={!$hasSidebarItems}>
        {#if $hasSidebarItems}
          <span class="navbar__sidebar-toggle">
            <SidebarToggle on:toggle={onToggleSidebar} />
          </span>
        {/if}
        <NavbarTitle />
      </div>
    {/if}
  </slot>

  <slot name="sidebar">
    <Sidebar bind:open={isSidebarOpen}>
      <svelte:fragment slot="start">
        <slot name="sidebar-start" />
      </svelte:fragment>

      <svelte:fragment slot="end">
        <slot name="sidebar-end" />
      </svelte:fragment>
    </Sidebar>
  </slot>

  <slot name="page">
    <Page>
      <svelte:fragment slot="start">
        <slot name="page-end" />
      </svelte:fragment>

      <svelte:fragment slot="end">
        <slot name="page-end" />
      </svelte:fragment>
    </Page>
  </slot>

  <slot name="root" />

  {#if isMarkdownPage && $isMarkdownFloatingTocEnabled}
    {#await import('../components/markdown/MarkdownFloatingToc.svelte') then c}
      <svelte:component this={c.default} />
    {/await}
  {/if}

  <slot name="scrim">
    {#if !$isLargeScreen}
      <div class="scrim">
        <Scrim
          active={isSidebarOpen}
          on:pointerdown={() => {
            isSidebarOpen = false;
          }}
          on:keydown={(e) => e.key === 'Enter' && (isSidebarOpen = false)}
        />
      </div>
    {/if}
  </slot>
</div>

<style>
  .theme {
    display: flex;
    font-family: var(--vbk--font-family-base);
    color: var(--vbk--color-text);
    background-color: var(--vbk--body-bg-color);
    line-height: 1.4;
    font-size: 100%;
    font-weight: 400;
    direction: ltr;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @media (max-width: 991px) {
    .theme.sidebar-open {
      overflow: hidden;
    }
  }

  .theme.no-navbar {
    --vbk--navbar-height: 4rem;
  }

  .theme.no-navbar .navbar-fallback {
    position: fixed;
    display: flex;
    align-items: center;
    top: 0;
    left: 0;
    height: var(--vbk--navbar-height);
    width: 100%;
    z-index: var(--vbk--navbar-z-index);
    background-color: var(--vbk--color-bg-100);
  }

  .navbar-fallback.no-sidebar-toggle {
    padding-left: 1rem;
  }

  .theme.no-navbar.dark .navbar-fallback {
    background-color: var(--vbk--color-bg-300);
  }

  .navbar__theme-switch {
    display: none;
  }

  @media (min-width: 992px) {
    .theme.no-navbar.sidebar-open {
      --vbk--navbar-height: 0px;
    }

    .theme.no-navbar.sidebar-open .navbar-fallback {
      display: none;
    }

    .theme.no-navbar:not(.sidebar-open) .navbar-fallback {
      padding-left: 1rem;
    }

    .navbar__theme-switch {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.2rem;
    }

    .scrim {
      display: none;
    }
  }
</style>
