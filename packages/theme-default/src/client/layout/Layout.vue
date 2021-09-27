<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { onBeforeMount, watch, watchEffect } from 'vue';

import Navbar from '../components/Navbar/Navbar.vue';
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
