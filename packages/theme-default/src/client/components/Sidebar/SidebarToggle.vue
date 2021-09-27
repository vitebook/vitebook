<script setup lang="ts">
import { computed } from 'vue';

import MenuIcon from ':virtual/vitebook/icons/menu';

import { defaultThemeLocaleOptions } from '../..';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import { useIsSidebarOpen } from './useSidebar';

const theme = useLocalizedThemeConfig();
const isSidebarOpen = useIsSidebarOpen();

const toggleAriaLabel = computed(
  () =>
    theme.value.sidebar?.toggleAriaLabel ??
    defaultThemeLocaleOptions.sidebar.toggleAriaLabel
);
</script>

<template>
  <button
    class="sidebar-toggle"
    :aria-label="toggleAriaLabel"
    @pointerdown="isSidebarOpen = !isSidebarOpen"
    @keydown.enter="isSidebarOpen = !isSidebarOpen"
  >
    <div class="sidebar-toggle__container">
      <MenuIcon />
    </div>
  </button>
</template>
