<script>
  import { currentPage, useSSRContext, variants } from '@vitebook/client';

  import { onMount } from 'svelte';

  import { isMarkdownFloatingTocEnabled } from '../components/markdown/isMarkdownFloatingTocEnabled';
  import NavbarTitle from '../components/navbar/NavbarTitle.svelte';
  import Scrim from '../components/Scrim.svelte';
  import VariantsMenu from '../components/VariantsMenu.svelte';
  import { hasSidebarItems } from '../components/sidebar/hasSidebarItems';
  import Sidebar from '../components/sidebar/Sidebar.svelte';
  import SidebarToggle from '../components/sidebar/SidebarToggle.svelte';
  import ThemeSwitch from '../components/ThemeSwitch.svelte';
  import DiscordLink from '../components/links/DiscordLink.svelte';
  import RepoLink from '../components/links/RepoLink.svelte';
  import { addons } from '@vitebook/client/addons';
  import TwitterLink from '../components/links/TwitterLink.svelte';
  import { darkMode, useDarkMode } from '../stores/darkMode';
  import { isLargeScreen } from '../stores/isLargeScreen';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';
  import Page from './Page.svelte';

  if (import.meta.env.SSR) {
    const ctx = useSSRContext();
    ctx.head.push([
      'script',
      {},
      `
  const key = '@vitebook/color-scheme';
  const saved = window.localStorage.getItem(key) ?? 'auto';
  const dark = saved === 'auto' ?
    window.matchMedia('(prefers-color-scheme: dark)').matches
    : saved === 'dark';
  if (dark) {
    const htmlEl = window.document.querySelector('html');
    htmlEl.classList.add('dark')
  }
    `,
    ]);
  }

  useDarkMode();

  let isSidebarOpen = false;
  let hasMounted = false;

  $: noNavbar = $localizedThemeConfig.navbar === false;
  $: noVariantsMenu = $localizedThemeConfig.variantsMenuEnable === false;
  $: noDirectory = $localizedThemeConfig.directoryEnable === false;
  $: isMarkdownPage = $currentPage?.type?.endsWith('md');
  $: hasVariants = Object.values($variants).length > 0;
  $: showPreviewTopBar = hasVariants;

  onMount(() => {
    let scrollbarWidth = window.innerWidth - document.body.clientWidth + 'px';
    document.documentElement.style.setProperty(
      '--vbk--scrollbar-width',
      scrollbarWidth,
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
      {#await import('../components/navbar/Navbar.svelte') then Navbar}
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
                <TwitterLink />
                <DiscordLink />
                <RepoLink />
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

  <div class="preview" class:md={isMarkdownPage}>
    <slot name="preview-top-bar-start" />

    {#if showPreviewTopBar}
      <div class="preview__top-bar">
        <div style="flex-grow: 1;" />
        {#if !noVariantsMenu}
          <VariantsMenu />
        {/if}
        <div style="flex-grow: 1;" />
      </div>
    {/if}

    <slot name="preview-top-bar-end" />

    <div class="preview__content">
      <slot name="page">
        <Page>
          <svelte:fragment slot="start">
            <slot name="page-start" />
          </svelte:fragment>

          <svelte:fragment slot="end">
            <slot name="page-end" />
          </svelte:fragment>
        </Page>
      </slot>
    </div>

    <slot name="preview-end" />
  </div>

  <slot name="addons">
    {#if !isMarkdownPage && Object.values($addons).length > 0 && !!$currentPage?.type}
      {#await import('../components/addons/Addons.svelte') then Addons}
        <svelte:component this={Addons.default}>
          <svelte:fragment slot="start">
            <slot name="addons-start" />
          </svelte:fragment>

          <svelte:fragment slot="end">
            <slot name="addons-end" />
          </svelte:fragment>
        </svelte:component>
      {/await}
    {/if}
    {#if !isMarkdownPage && !noDirectory}
      {#await import('@vitebook/client/addons/directory/DirectoryAddon.svelte') then Directory}
        <svelte:component this={Directory.default} />
      {/await}
    {/if}
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
    background-color: var(--vbk--navbar-bg-color);
    border-bottom: 0.125rem solid var(--vbk--color-divider);
  }

  .navbar-fallback.no-sidebar-toggle {
    padding-left: 1rem;
  }

  .navbar__theme-switch {
    display: none;
  }

  .preview {
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 0;
    min-height: calc(calc(100vh - var(--vbk--navbar-height)) + 8px);
    padding-top: var(--vbk--navbar-height);
    flex: none;
    width: 100%;
  }

  .preview:not(.md) {
    background-color: #d9d9d9;
  }

  .theme.dark .preview:not(.md) {
    background-color: #2a2a2a;
  }

  .preview__top-bar {
    position: sticky;
    display: flex;
    padding: 1rem;
    top: 0;
    flex-grow: 0;
    flex-shrink: 0;
    margin: 0;
    width: 100%;
    background-color: var(--vbk--body-bg-color);
    z-index: calc(var(--vbk--navbar-z-index) - 10);
  }

  .preview__content {
    flex: 1 0 0;
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

    .preview {
      flex: 1 0 0;
      width: auto;
    }

    .scrim {
      display: none;
    }
  }
</style>
