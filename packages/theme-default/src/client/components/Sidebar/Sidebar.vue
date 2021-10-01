<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { computed, defineAsyncComponent, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import BackArrowIcon from ':virtual/vitebook/icons/back-arrow?raw&vue';

import { defaultThemeLocaleOptions } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NavbarTitle from '../Navbar/NavbarTitle.vue';
import { useHasNavbarItems } from '../Navbar/useNavbar';
import ThemeSwitch from '../ThemeSwitch.vue';
import SidebarLinks from './SidebarLinks.vue';
import { useHasSidebarItems, useIsSidebarOpen } from './useSidebar';

const route = useRoute();
const isSidebarOpen = useIsSidebarOpen();
const theme = useLocalizedThemeConfig();
const hasNavItems = useHasNavbarItems();
const hasSidebarItems = useHasSidebarItems();
const isLargeScreen = useMediaQuery('(min-width: 992px)');

const backToMainMenuText = computed(
  () =>
    theme.value.sidebar?.backToMainMenuText ??
    defaultThemeLocaleOptions.sidebar.backToMainMenuText
);

const isMainMenuShowing = ref(false);

const hasMainMenuItems = computed(() =>
  !isLargeScreen.value ? hasNavItems.value : false
);

const forceSidebarOpen = computed(
  () => isLargeScreen.value && hasSidebarItems.value
);

watch(
  () => route.path,
  () => {
    if (!forceSidebarOpen.value) isSidebarOpen.value = false;
  }
);

watchEffect(() => {
  if (isLargeScreen.value) {
    isMainMenuShowing.value = false;
  } else {
    isSidebarOpen.value = false;
  }
});

watchEffect(() => {
  if (isLargeScreen.value && !hasSidebarItems.value) {
    isSidebarOpen.value = false;
  }
});

watchEffect(() => {
  if (!isSidebarOpen.value && forceSidebarOpen.value) {
    isSidebarOpen.value = true;
  }
});

watchEffect(() => {
  isMainMenuShowing.value =
    (!isSidebarOpen.value && !hasSidebarItems.value) ||
    (!hasSidebarItems.value && hasMainMenuItems.value);
});

watchEffect(() => {
  if (isSidebarOpen.value) {
    document.documentElement.classList.add('sidebar-open');
  } else {
    document.documentElement.classList.remove('sidebar-open');
  }
});

function handleToggleMenus() {
  isMainMenuShowing.value = !isMainMenuShowing.value;
}

const NavLinks = defineAsyncComponent(() => import('../Navbar/NavLinks.vue'));
</script>

<template>
  <aside
    class="sidebar"
    :class="{ open: isSidebarOpen, 'icon-colors': theme.sidebar?.iconColors }"
    :aria-hidden="!isSidebarOpen"
  >
    <slot name="start" />

    <div
      v-if="!isLargeScreen || theme.navbar === false"
      class="sidebar__header"
    >
      <div class="sidebar__header-wrapper">
        <NavbarTitle />
        <div class="flex-grow"></div>
        <ThemeSwitch />
      </div>
    </div>

    <div class="sidebar__body">
      <button
        v-if="hasMainMenuItems"
        class="sidebar__back-button"
        :aria-hidden="isMainMenuShowing"
        @pointerdown="handleToggleMenus"
        @keydown.enter="handleToggleMenus"
      >
        <BackArrowIcon class="sidebar__back-button__arrow" />
        {{ backToMainMenuText }}
      </button>

      <NavLinks
        v-if="hasMainMenuItems"
        class="sidebar__main-menu"
        :aria-hidden="!isMainMenuShowing"
      />

      <SidebarLinks
        v-if="hasSidebarItems"
        class="sidebar__current-menu"
        :aria-hidden="isMainMenuShowing"
      />
    </div>

    <slot name="end" />
  </aside>
</template>

<style>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  flex: 0 0 auto;
  z-index: var(--vbk--sidebar-z-index);
  width: 80vw;
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
  padding-top: 0.25rem;
}

.sidebar__header-wrapper {
  display: flex;
  padding: 1rem;
}

.sidebar__back-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  border: 0;
  font-size: 1rem;
  margin-top: 0.2rem;
  font-weight: 500;
  border-radius: 0.12rem;
  color: var(--vbk--color-text);
  white-space: nowrap;
  text-decoration: none;
  background-color: var(--vbk--color-gray-100);
  text-align: left;
  cursor: pointer;
  line-height: 1.5;
}

.sidebar__back-button__arrow {
  margin-right: 0.25rem;
}

.sidebar__back-button[aria-hidden='true'] {
  display: none;
}

.sidebar__body {
  padding: 0 1rem;
  margin-top: 0.375rem;
}

.sidebar__main-menu {
  display: none;
}

.sidebar__main-menu[aria-hidden='false'] {
  display: block;
}

.sidebar__current-menu {
  margin-top: 1rem;
}

.sidebar__current-menu[aria-hidden='true'] {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  .sidebar__back-button:hover {
    background-color: var(--vbk--color-gray-100);
  }
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

  html.dark .sidebar {
    border-right: 0.125rem solid var(--vbk--color-gray-500);
  }

  .sidebar:not(.sidebar.open) {
    width: 0;
    min-width: 0;
    opacity: 0;
    visibility: hidden;
  }

  .sidebar__header {
    /* display: none; */
  }

  .sidebar__back-button {
    display: none;
  }
}
</style>
