<script setup lang="ts">
import SidebarItem from './SidebarItem';
import { useSidebarItems } from './useSidebar';

const items = useSidebarItems();
</script>

<template>
  <nav class="sidebar__links">
    <ul v-if="items.length > 0" class="sidebar__links__list">
      <SidebarItem
        v-for="(item, i) of items"
        :key="i"
        :item="item"
        class="sidebar__links__list-item"
      />
    </ul>
  </nav>
</template>
