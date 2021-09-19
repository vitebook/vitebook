<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NavbarTitle from '../Navbar/NavbarTitle.vue';
import NavLinks from '../Navbar/NavLinks.vue';
import { useHasNavbarItems } from '../Navbar/useNavbar';
import ThemeSwitch from '../ThemeSwitch.vue';
import SidebarLinks from './SidebarLinks.vue';
import { useHasSidebarItems, useIsSidebarOpen } from './useSidebar';

const route = useRoute();
const isSidebarOpen = useIsSidebarOpen();
const themeConfig = useLocalizedThemeConfig();
const hasNavItems = useHasNavbarItems();
const hasSidebarItems = useHasSidebarItems();
const isLargeScreen = useMediaQuery('(min-width: 992px)');

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

function handleToggleMenus() {
  isMainMenuShowing.value = !isMainMenuShowing.value;
}
</script>

<template>
  <aside class="sidebar" :aria-hidden="!isSidebarOpen">
    <slot name="start" />

    <div v-if="!isLargeScreen" class="header">
      <div class="header-wrapper">
        <NavbarTitle />
        <div class="flex-grow"></div>
        <ThemeSwitch />
      </div>
    </div>

    <div class="links">
      <button
        v-if="hasMainMenuItems"
        class="back-button"
        :aria-hidden="isMainMenuShowing"
        @pointerdown="handleToggleMenus"
        @keydown.enter="handleToggleMenus"
      >
        {{ themeConfig.sidebar.backToMainMenuText }}
      </button>

      <NavLinks
        v-if="hasMainMenuItems"
        class="main-menu"
        :aria-hidden="!isMainMenuShowing"
      />

      <SidebarLinks
        v-if="hasSidebarItems"
        class="current-menu"
        :aria-hidden="isMainMenuShowing"
      />
    </div>

    <slot name="end" />
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  flex: 0 0 auto;
  z-index: var(--sidebar-z-index);
  width: 80vw;
  background-color: var(--color-bg-200);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.35s ease;
}

.sidebar[aria-hidden='false'] {
  transform: translateX(0);
}

.header {
  padding-top: 0.25rem;
}

.header-wrapper {
  display: flex;
  padding: 1rem;
}

.flex-grow {
  flex: 1;
}

.back-button[aria-hidden='true'] {
  display: none;
}

.links {
  padding: 0 1rem;
  margin-top: 0.375rem;
}

:deep(.nav-item) {
  margin-top: 0.25rem;
}

.main-menu {
  display: none;
}

.main-menu[aria-hidden='false'] {
  display: block;
}

.current-menu {
  margin-top: 1rem;
}

.current-menu[aria-hidden='true'] {
  display: none;
}

@media (min-width: 992px) {
  .header {
    display: none;
  }

  .back-button {
    display: none;
  }

  .sidebar {
    position: relative;
    width: auto;
    min-width: var(--sidebar-min-width);
    height: 100vh;
    opacity: 1;
    z-index: 0;
    transition: unset;
    padding-top: var(--navbar-height);
  }

  .sidebar[aria-hidden='true'] {
    width: 0;
    min-width: 0;
    opacity: 0;
    visibility: hidden;
  }
}
</style>
