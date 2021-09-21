<script setup lang="ts">
import BackArrowIcon from '@virtual/vitebook/icons/back-arrow';
import { useMediaQuery } from '@vueuse/core';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { defaultThemeLocaleOptions } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NavbarTitle from '../Navbar/NavbarTitle.vue';
import NavLinks from '../Navbar/NavLinks.vue';
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
  <aside
    class="sidebar"
    :class="{ open: isSidebarOpen }"
    :aria-hidden="!isSidebarOpen"
  >
    <slot name="start" />

    <div v-if="!isLargeScreen" class="sidebar__header">
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
