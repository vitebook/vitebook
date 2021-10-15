<script>
  import { onMount } from 'svelte';

  import NavbarTitle from '../components/Navbar/NavbarTitle.svelte';
  import Scrim from '../components/Scrim.svelte';
  import ThemeSwitch from '../components/ThemeSwitch.svelte';
  import { darkMode, useDarkMode } from '../stores/darkMode';
  import { localizedThemeConfig } from '../stores/localizedThemeConfig';
  import { useMediaQuery } from '../stores/useMediaQuery';
  import Page from './Page.svelte';

  useDarkMode();

  let isSidebarOpen = false;

  const hasSidebarItems = false;
  const isLargeScreen = useMediaQuery('(min-width: 992px)');

  $: noNavbar = $localizedThemeConfig.navbar === false;

  onMount(() => {
    let scrollbarWidth = window.innerWidth - document.body.clientWidth + 'px';
    document.documentElement.style.setProperty(
      '--vbk--scrollbar-width',
      scrollbarWidth
    );
  });

  onMount(() => {
    return localizedThemeConfig.subscribe((config) => {
      if (config.navbar !== false) {
        document.documentElement.classList.remove('no-navbar');
      } else {
        document.documentElement.classList.add('no-navbar');
      }
    });
  });
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
            <!-- <SidebarToggle /> -->
          </svelte:fragment>

          <svelte:fragment slot="end">
            <slot name="navbar-end">
              <ThemeSwitch class="navbar__theme-switch" />
              <!-- pointless element to silence warning. -->
              <span class="navbar__theme-switch" style="display: none;" />
            </slot>
          </svelte:fragment>
        </svelte:component>
      {/await}
    {:else}
      <div class="navbar-fallback" class:no-sidebar-toggle={!hasSidebarItems}>
        {#if !hasSidebarItems}
          <!-- <SidebarToggle /> -->
        {/if}
        <NavbarTitle />
      </div>
    {/if}
  </slot>

  <slot name="sidebar">
    <!-- <Sidebar>
      <svelte:fragment slot="start">
        <slot name="sidebar-start" />
      </svelte:fragment>

      <svelte:fragment slot="end">
        <slot name="sidebar-end" />
      </svelte:fragment>
    </Sidebar> -->
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

  <slot name="scrim">
    {#if !$isLargeScreen}
      <div class="theme__scrim">
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

  /* .theme.no-navbar .sidebar-toggle {
    padding-left: 0.75rem;
  } */

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

    .theme__scrim {
      display: none;
    }
  }
</style>
