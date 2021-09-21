<script setup lang="ts">
import MenuCaretIcon from '@virtual/vitebook/icons/menu-caret';
import { inBrowser } from '@vitebook/core/shared';
import { computed, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

import type { NavItemWithMenu } from '../../../shared';
import NavItemLink from './NavItemLink.vue';

const props = defineProps<{
  item: NavItemWithMenu;
}>();

const propsRef = toRefs(props);
const route = useRoute();
const isMenuOpen = ref(false);

const navItem = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLButtonElement | null>(null);

watch(
  () => route.path,
  () => {
    if (!inBrowser) return;

    if (window.innerWidth >= 992) {
      isMenuOpen.value = false;
    } else {
      window.requestAnimationFrame(() => {
        if (!navItem.value?.querySelector('a.active')) {
          isMenuOpen.value = false;
        }
      });
    }
  }
);

const menuId = computed(
  () => `nav-menu-${propsRef.item.value.text.replace(/\s/g, '-').toLowerCase()}`
);

const menuButtonId = computed(
  () =>
    `nav-menu-button-${propsRef.item.value.text
      .replace(/\s/g, '-')
      .toLowerCase()}`
);

function onToggle() {
  isMenuOpen.value = !isMenuOpen.value;
}

// TODO: poor man's accessbility, fix later.
function onKeyDown(e: KeyboardEvent) {
  if (!isMenuOpen.value) return;

  if (e.key === 'Esc' || e.key === 'Escape') {
    isMenuOpen.value = false;
    menuButton.value?.focus();
  } else if (e.key === 'Tab') {
    window.requestAnimationFrame(() => {
      if (!navItem.value?.contains(document.activeElement)) {
        isMenuOpen.value = false;
      }
    });
  }
}

function onMenuPointerLeave() {
  if (window.innerWidth >= 992) {
    isMenuOpen.value = false;
  }
}
</script>

<template>
  <div
    ref="navItem"
    class="nav-item with-menu"
    :class="{ 'with-menu-open': isMenuOpen }"
    @keydown="onKeyDown"
  >
    <button
      :id="menuButtonId"
      ref="menuButton"
      class="nav-item__menu-button"
      :aria-label="item.ariaLabel"
      :aria-controls="menuId"
      aria-haspopup="true"
      @pointerdown="onToggle"
      @keydown.enter="onToggle"
    >
      <span class="nav-item__menu-button__text">{{ item.text }}</span>
      <MenuCaretIcon class="nav-item__menu-button__caret" />
    </button>

    <ul
      :id="menuId"
      class="nav-item__menu"
      :aria-labelledby="menuButtonId"
      :aria-expanded="isMenuOpen"
      @pointerleave="onMenuPointerLeave"
    >
      <li
        v-for="menuItem in item.menu"
        :key="menuItem.text"
        class="nav-item__menu-item"
      >
        <NavItemLink :item="menuItem" />
      </li>
    </ul>
  </div>
</template>
