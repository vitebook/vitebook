<script setup lang="ts">
import { SidebarItemGroup } from '@vitebook/core/shared';

const props = defineProps<{
  item: SidebarItemGroup;
  depth: number;
}>();

// button
// id
// :aria-controls="menuId"
// aria-haspopup="true"
// @pointerdown="onToggle"
// @keydown.enter="onToggle"

// menu
// id
// :aria-labelledby="menuButtonId"
// :aria-expanded="isMenuOpen"
// @pointerleave="onMenuPointerLeave"
</script>

<template>
  <li class="sidebar-item-group">
    <button class="sidebar-item-group-button">
      {{ item.text }}
    </button>

    <ul class="sidebar-item-group-menu">
      <slot />
    </ul>
  </li>
</template>

<style scoped>
.sidebar-item-group-menu {
  margin-left: 1rem;
}
</style>
