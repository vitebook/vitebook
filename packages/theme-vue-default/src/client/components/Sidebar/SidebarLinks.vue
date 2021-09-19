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
