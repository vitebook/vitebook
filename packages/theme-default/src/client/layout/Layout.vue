<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { defineAsyncComponent, onBeforeMount, watch, watchEffect } from 'vue';

import NavbarTitle from '../components/Navbar/NavbarTitle.vue';
import Scrim from '../components/Scrim/Scrim.vue';
import { useIsScrimActive } from '../components/Scrim/useScrim';
import Sidebar from '../components/Sidebar/Sidebar.vue';
import SidebarToggle from '../components/Sidebar/SidebarToggle.vue';
import {
  useHasSidebarItems,
  useIsSidebarOpen
} from '../components/Sidebar/useSidebar';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import { initDarkMode } from '../composables/useDarkMode';
import { useLocalizedThemeConfig } from '../composables/useLocalizedThemeConfig';
import Page from './Page.vue';

initDarkMode();

const theme = useLocalizedThemeConfig();
const isSidebarOpen = useIsSidebarOpen();
const isScrimActive = useIsScrimActive();
const hasSidebarItems = useHasSidebarItems();

watch(
  () => isSidebarOpen.value,
  (isActive) => {
    isScrimActive.value = isActive;
  }
);

const isLargeScreen = useMediaQuery('(min-width: 992px)');

onBeforeMount(() => {
  let scrollbarWidth = window.innerWidth - document.body.clientWidth + 'px';
  document.documentElement.style.setProperty(
    '--vbk--scrollbar-width',
    scrollbarWidth
  );
});

watchEffect(() => {
  if (theme.value.navbar !== false) {
    document.documentElement.classList.remove('no-navbar');
  } else {
    document.documentElement.classList.add('no-navbar');
  }
});

const Navbar = defineAsyncComponent(
  () => import('../components/Navbar/Navbar.vue')
);
</script>

<template>
  <div class="theme">
    <slot name="navbar">
      <Navbar v-if="theme.navbar !== false">
        <template #start>
          <slot name="navbar-start" />
          <SidebarToggle />
        </template>

        <template #end>
          <slot name="navbar-end">
            <ThemeSwitch class="navbar__theme-switch" />
          </slot>
        </template>
      </Navbar>

      <div
        v-else
        class="navbar-fallback"
        :class="{ 'no-sidebar-toggle': !hasSidebarItems }"
      >
        <SidebarToggle v-if="hasSidebarItems" />
        <NavbarTitle />
      </div>
    </slot>

    <slot name="sidebar">
      <Sidebar>
        <template #start>
          <slot name="sidebar-start" />
        </template>

        <template #end>
          <slot name="sidebar-end" />
        </template>
      </Sidebar>
    </slot>

    <slot name="page">
      <Page>
        <template #start>
          <slot name="page-start" />
        </template>

        <template #end>
          <slot name="page-end" />
        </template>
      </Page>
    </slot>

    <slot name="root" />

    <!-- Portal target. -->
    <div id="layout-portal-root"></div>

    <slot name="scrim">
      <Scrim
        v-if="!isLargeScreen"
        :is-active="isSidebarOpen"
        @pointerdown="isSidebarOpen = false"
        @keydown.enter="isSidebarOpen = false"
      />
    </slot>
  </div>
</template>

<style>
.theme {
  display: flex;
}

html.no-navbar .theme {
  --vbk--navbar-height: 4rem;
}

html.no-navbar .navbar-fallback {
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

html.no-navbar .sidebar-toggle {
  padding-left: 0.75rem;
}

html.no-navbar.dark .navbar-fallback {
  background-color: var(--vbk--color-bg-300);
}

.navbar__theme-switch {
  display: none;
}

@media (min-width: 992px) {
  html.no-navbar.sidebar-open .theme {
    --vbk--navbar-height: 0;
  }

  html.no-navbar.sidebar-open .navbar-fallback {
    display: none;
  }

  html.no-navbar:not(.sidebar-open) .navbar-fallback {
    padding-left: 1rem;
  }

  .navbar__theme-switch {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.2rem;
  }

  .theme .scrim {
    display: none;
  }
}
</style>
