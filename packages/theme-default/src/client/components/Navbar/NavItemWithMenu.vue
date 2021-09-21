<script setup lang="ts">
import { inBrowser } from '@vitebook/core/shared';
import { useMediaQuery } from '@vueuse/core';
import { computed, onMounted, onUpdated, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

import MenuCaretIcon from ':virtual/vitebook/icons/menu-caret';

import type { NavItemWithMenu } from '../../../shared';
import NavItemLink from './NavItemLink.vue';
import { useLanguageLinks } from './useLanguageLinks';

const props = defineProps<{
  item: NavItemWithMenu;
}>();

const propsRef = toRefs(props);
const route = useRoute();
const isLargeScreen = useMediaQuery('(min-width: 992px)');

const isMenuOpen = ref(false);
const isMenuActive = ref(false);
const navItem = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLButtonElement | null>(null);

watch(
  () => route.path,
  () => {
    if (!inBrowser) return;

    if (isLargeScreen.value) {
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

const langLinks = useLanguageLinks();
const isLanguagesGroup = computed(
  () => propsRef.item.value.text === langLinks.value?.text
);

function onMenuPointerLeave() {
  if (isLargeScreen.value) {
    isMenuOpen.value = false;
  }
}

function checkHasActiveItem() {
  if (!isLanguagesGroup.value) {
    isMenuActive.value = !!navItem.value?.querySelector('a.active');
  }
}

onMounted(() => {
  checkHasActiveItem();
  if (!isLargeScreen.value && !isLanguagesGroup.value) {
    isMenuOpen.value = isMenuActive.value;
  }
});

onUpdated(() => {
  window.requestAnimationFrame(checkHasActiveItem);
});
</script>

<template>
  <div
    ref="navItem"
    class="nav-item with-menu"
    :class="{ open: isMenuOpen, active: isMenuActive }"
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
