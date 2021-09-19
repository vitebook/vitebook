<script setup lang="ts">
import SidebarItem from './SidebarItem';
import { useSidebarItems } from './useSidebar';

const items = useSidebarItems();
</script>

<template>
  <nav>
    <ul v-if="items.length > 0" class="sidebar-links">
      <SidebarItem v-for="(item, i) of items" :key="i" :item="item" />
    </ul>
  </nav>
</template>

<style scoped>
:deep(ul) {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

:deep(li) {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  min-width: 10.5rem;
  border-radius: 0.12rem;
  color: var(--color-text);
  white-space: nowrap;
}

:deep(a),
:deep(button) {
  display: block;
  width: 100%;
  padding: 0.5rem 0;
  border: 0;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.12rem;
  color: var(--color-text);
  white-space: nowrap;
  text-decoration: none;
  background-color: transparent;
  text-align: left;
  cursor: pointer;
  line-height: 1.5;
}

:deep(a.active) {
  /*  */
}

:deep(a),
:deep(button) {
  padding-left: 0.5rem;
}

@media (hover: hover) and (pointer: fine) {
  :deep(a:hover),
  :deep(button:hover) {
    background-color: var(--color-bg-100);
  }
}
</style>
