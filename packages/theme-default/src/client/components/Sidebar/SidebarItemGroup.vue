<script setup lang="ts">
import FolderClosedIcon from '@virtual/vitebook/icons/sidebar-folder-closed';
import FolderOpenIcon from '@virtual/vitebook/icons/sidebar-folder-open';
import { onMounted, onUpdated, ref } from 'vue';

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
    class="sidebar-item-group"
    :class="{ active: isActive, open: isFolderOpen }"
  >
    <button
      :id="`sidebar-menu-button-${depth}`"
      class="menu-button"
      :aria-controls="`sidebar-menu-${depth}`"
      aria-haspopup="true"
      @pointerdown="onToggle"
      @keydown.enter="onToggle"
    >
      <FolderOpenIcon v-if="isFolderOpen" />
      <FolderClosedIcon v-if="!isFolderOpen" />
      {{ item.text }}
    </button>

    <ul
      :id="`sidebar-menu-${depth}`"
      class="menu"
      :aria-labelledby="`sidebar-menu-button-${depth}`"
      :aria-expanded="isFolderOpen"
    >
      <slot />
    </ul>
  </li>
</template>

<style scoped>
.menu {
  display: none;
}

.sidebar-item-group.active > button {
  color: var(--sidebar-item-active-color);
}

.sidebar-item-group.open > .menu {
  display: block;
}

.menu {
  margin-left: 1rem;
}
</style>
