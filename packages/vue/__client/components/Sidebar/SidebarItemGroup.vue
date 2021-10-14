<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue';

import FolderClosedIcon from ':virtual/vitebook/icons/sidebar-folder-closed?raw&vue';
import FolderOpenIcon from ':virtual/vitebook/icons/sidebar-folder-open?raw&vue';

import type { SidebarItemGroup } from '../../../shared';

const props = defineProps<{
  item: SidebarItemGroup;
  depth: number;
}>();

const rootRef = ref<HTMLElement | null>(null);
const isFolderOpen = ref(false);
const isActive = ref(false);

function checkHasActiveItem() {
  isActive.value = !!rootRef.value?.querySelector('a.active');
}

onMounted(() => {
  checkHasActiveItem();
  isFolderOpen.value = isActive.value;
});

onUpdated(() => {
  window.requestAnimationFrame(checkHasActiveItem);
});

function onToggle() {
  isFolderOpen.value = !isFolderOpen.value;
}
</script>

<template>
  <li
    ref="rootRef"
    class="sidebar-item with-menu"
    :class="{
      active: isActive,
      open: isFolderOpen
    }"
  >
    <button
      :id="`sidebar-menu-button-${depth}`"
      :aria-controls="`sidebar-menu-${depth}`"
      aria-haspopup="true"
      class="sidebar-item__menu-button"
      @pointerdown="onToggle"
      @keydown.enter="onToggle"
    >
      <FolderOpenIcon v-if="isFolderOpen" />
      <FolderClosedIcon v-if="!isFolderOpen" />
      {{ item.text }}
    </button>

    <ul
      :id="`sidebar-menu-${depth}`"
      :aria-labelledby="`sidebar-menu-button-${depth}`"
      :aria-expanded="isFolderOpen"
      class="sidebar-item__menu"
    >
      <slot />
    </ul>
  </li>
</template>

<style>
.sidebar__body .nav-item__menu,
.sidebar-item__menu {
  display: none !important;
  margin-left: 1rem !important;
}

.sidebar__body .nav-item.open > .nav-item__menu,
.sidebar-item.open > .sidebar-item__menu {
  display: block !important;
}
</style>
