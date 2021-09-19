<script setup lang="ts">
import { SidebarGroup } from '@vitebook/core/shared';

const props = defineProps<{
  item: SidebarGroup;
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
  <li class="sidebar-group">
    <button class="sidebar-group-button">
      {{ item.text }}
    </button>

    <ul class="sidebar-group-menu">
      <slot />
    </ul>
  </li>
</template>
