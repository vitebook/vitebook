<script setup lang="ts">
import { PageView } from '@vitebook/vue/client';

import { useIsSidebarOpen } from '../components/Sidebar/useSidebar';

const isSidebarOpen = useIsSidebarOpen();
</script>

<template>
  <div class="container" :class="{ 'with-sidebar': isSidebarOpen }">
    <slot name="start" />
    <div class="page-view">
      <PageView />
    </div>
    <slot name="end" />
  </div>
</template>

<style scoped>
.container {
  padding-top: var(--navbar-height);
}

.page-view {
  width: 100%;
  display: inline-block;
  position: relative;
  margin: 0;
  min-height: calc(100vh - var(--navbar-height));
  background-color: var(--color-bg-100);
}

@media (min-width: 992px) {
  .container.with-sidebar {
    padding-left: var(--sidebar-width);
    transition: padding 0.135s ease;
  }
}
</style>
