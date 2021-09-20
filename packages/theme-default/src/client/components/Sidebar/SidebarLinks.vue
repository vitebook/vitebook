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
  min-width: var(--sidebar-item-min-width);
  border-radius: var(--sidebar-item-border-radius);
  white-space: nowrap;
}

:deep(a),
:deep(button) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--sidebar-item-padding);
  border: 0;
  font-size: var(--sidebar-item-font-size);
  margin-top: var(--sidebar-item-spacing);
  font-weight: var(--sidebar-item-font-weight);
  border-radius: var(--sidebar-item-border-radius);
  color: var(--sidebar-item-color);
  white-space: nowrap;
  text-decoration: none;
  background-color: var(--sidebar-item-bg-color);
  text-align: left;
  cursor: pointer;
  line-height: var(--sidebar-item-line-height);
}

:deep(a > span > svg),
:deep(button > svg) {
  margin-right: 0.5rem;
}

:deep(a > span) {
  display: flex;
  align-items: center;
}

:deep(a.active) {
  color: var(--sidebar-item-active-color);
  background-color: var(--sidebar-item-active-bg-color);
}

:deep(a),
:deep(button) {
  padding-left: 0.5rem;
}

@media (hover: hover) and (pointer: fine) {
  :deep(a:hover),
  :deep(button:hover) {
    color: var(--sidebar-item-hover-color);
    background-color: var(--sidebar-item-hover-bg-color);
  }
}
</style>
