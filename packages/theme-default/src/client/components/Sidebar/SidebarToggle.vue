<script setup lang="ts">
import { computed } from 'vue';

import MenuIcon from ':virtual/vitebook/icons/menu?raw&vue';

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

<style>
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  margin-right: 0.375rem;
  padding-left: 1rem;
  font-size: 1.5rem;
  border: 0;
  border-radius: 0.15rem;
  cursor: pointer;
  color: var(--vbk--toggle-color);
  background-color: var(--vbk--toggle-bg-color);
}

.sidebar-toggle > div {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

@media (hover: hover) and (pointer: fine) {
  .sidebar-toggle:hover > div {
    color: var(--vbk--toggle-hover-color);
    background-color: var(--vbk--toggle-hover-bg-color);
  }
}

@media (min-width: 992px) {
  .sidebar-toggle {
    display: none;
    padding-left: 1.25rem;
  }
}
</style>
