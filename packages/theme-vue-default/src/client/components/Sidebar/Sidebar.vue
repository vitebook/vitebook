<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';

import NavbarTitle from '../Navbar/NavbarTitle.vue';
import NavLinks from '../Navbar/NavLinks.vue';
import ThemeSwitch from '../ThemeSwitch.vue';
import { useSidebar } from './useSidebar';

const { isSidebarOpen } = useSidebar();

const route = useRoute();

watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false;
  }
);
</script>

<template>
  <aside class="sidebar" :class="{ open: isSidebarOpen }">
    <slot name="start" />

    <div class="header">
      <div class="header-wrapper">
        <NavbarTitle />
        <div class="flex-grow"></div>
        <ThemeSwitch />
      </div>
    </div>

    <div class="sidebar-links">
      <NavLinks />
    </div>

    <!-- ... -->

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
  border-bottom: 0.12rem solid var(--color-divider);
}

.header-wrapper {
  display: flex;
  padding: 1rem;
}

.flex-grow {
  flex: 1;
}

.sidebar-links {
  padding: 0 1rem;
  margin-top: 0.5rem;
}

:deep(.nav-item) {
  margin-top: 0.25rem;
}
</style>
