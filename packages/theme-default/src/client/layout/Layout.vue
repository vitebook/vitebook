<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { computed, watch } from 'vue';

import MenuIcon from ':virtual/vitebook/icons/menu';

import { defaultThemeLocaleOptions } from '../../shared';
import Navbar from '../components/Navbar/Navbar.vue';
import Scrim from '../components/Scrim/Scrim.vue';
import { useIsScrimActive } from '../components/Scrim/useScrim';
import Sidebar from '../components/Sidebar/Sidebar.vue';
import { useIsSidebarOpen } from '../components/Sidebar/useSidebar';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import { initDarkMode } from '../composables/useDarkMode';
import { useLocalizedThemeConfig } from '../composables/useLocalizedThemeConfig';
import Page from './Page.vue';

initDarkMode();

const theme = useLocalizedThemeConfig();
const isSidebarOpen = useIsSidebarOpen();
const isScrimActive = useIsScrimActive();

watch(
  () => isSidebarOpen.value,
  (isActive) => {
    isScrimActive.value = isActive;
  }
);

const isLargeScreen = useMediaQuery('(min-width: 992px)');

const toggleAriaLabel = computed(
  () =>
    theme.value.navbar?.toggleAriaLabel ??
    defaultThemeLocaleOptions.navbar.toggleAriaLabel
);
</script>

<template>
  <div class="theme">
    <slot name="navbar">
      <Navbar>
        <template #start>
          <slot name="navbar-start" />
          <button
            class="navbar__menu-toggle"
            :aria-label="toggleAriaLabel"
            @pointerdown="isSidebarOpen = !isSidebarOpen"
            @keydown.enter="isSidebarOpen = !isSidebarOpen"
          >
            <div>
              <MenuIcon />
            </div>
          </button>
        </template>

        <template #end>
          <slot name="navbar-end">
            <ThemeSwitch class="theme-switch" />
          </slot>
        </template>
      </Navbar>
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

<style scoped>
.theme {
  display: flex;
  background-color: var(--vbk--color-bg-200);
}

.theme-switch {
  display: none;
}

@media (min-width: 992px) {
  .theme-switch {
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
