<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
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

watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false;
  }
);

const themeConfig = useLocalizedThemeConfig();

const hasNavItems = useHasNavbarItems();
const hasSidebarItems = useHasSidebarItems();

const isMainMenuShowing = ref(false);

const windowSize = useWindowSize();

const hasMainMenuItems = computed(() =>
  windowSize.width.value < 992 ? hasNavItems.value : false
);

const forceSidebarOpen = computed(
  () => windowSize.width.value >= 992 && hasSidebarItems.value
);

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
  <aside
    class="sidebar"
    :class="{ open: isSidebarOpen || forceSidebarOpen }"
    :aria-hidden="isSidebarOpen && !forceSidebarOpen"
  >
    <slot name="start" />

    <div class="header">
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
        :class="{ open: isMainMenuShowing }"
        :aria-hidden="!isMainMenuShowing"
      />

      <SidebarLinks
        v-if="hasSidebarItems"
        class="current-menu"
        :class="{ open: !isMainMenuShowing }"
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
  z-index: var(--sidebar-z-index);
  width: 80vw;
  background-color: var(--color-bg-200);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.35s ease;
}

.sidebar.open {
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

.main-menu.open {
  display: block;
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
    width: var(--sidebar-width);
    margin-top: var(--navbar-height);
    transition: unset;
  }

  .sidebar.open {
    transition: transform 0.135s ease;
  }
}
</style>
