<script setup lang="ts">
import { watch } from 'vue';

import Navbar from '../components/Navbar/Navbar.vue';
import Scrim from '../components/Scrim/Scrim.vue';
import { useScrim } from '../components/Scrim/useScrim';
import Sidebar from '../components/Sidebar/Sidebar.vue';
import { useSidebar } from '../components/Sidebar/useSidebar';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import { initDarkMode } from '../composables/useDarkMode';
import Page from './Page.vue';

initDarkMode();

const { isSidebarOpen } = useSidebar();
const { isScrimActive } = useScrim();

watch(
  () => isSidebarOpen.value,
  (isActive) => {
    isScrimActive.value = isActive;
  }
);
</script>

<template>
  <div>
    <slot name="navbar">
      <Navbar @hamburger-click="isSidebarOpen = !isSidebarOpen">
        <template #start>
          <slot name="navbar-start" />
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

    <slot name="scrim">
      <Scrim
        :is-active="isSidebarOpen"
        @pointerdown="isSidebarOpen = false"
        @keydown.enter="isSidebarOpen = false"
      />
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
  </div>
</template>

<style scoped>
.theme-switch {
  display: none;
}

@media (min-width: 992px) {
  .theme-switch {
    display: block;
    margin-left: 0.2rem;
  }
}
</style>
