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

<style>
/** No mobile styles because a nav item menu is a sidebar group <992px. **/

.nav-item__menu-button__caret {
  padding-left: 0.12rem;
  transform: rotate(270deg) translateX(-0.25rem) translateZ(0);
  transform-origin: center;
}

.nav-item.open .nav-item__menu-button__caret {
  transform: translateY(0.1rem) translateZ(0);
}

@media (hover: hover) {
  .nav-item__menu-item:hover {
    color: var(--vbk--menu-item-hover-color);
    background-color: var(--vbk--menu-item-hover-bg-color);
  }

  .nav-item__menu-item .nav-link:not(.active) > .nav-link__text {
    border-bottom: 0;
  }

  .nav-item.with-menu:hover .nav-item__menu {
    opacity: 1;
    visibility: visible;
  }
}

@media (min-width: 992px) {
  .nav-item__menu-button__caret,
  .nav-item.open .nav-item__menu-button__caret {
    transform: translateY(0) translateZ(0);
  }

  .nav-item.with-menu {
    position: relative;
    cursor: pointer;
    overflow: visible;
    width: 100%;
  }

  .nav-item__menu {
    display: block;
    position: absolute;
    top: 100%;
    right: 1rem;
    padding: 0.8rem;
    padding-bottom: 1rem;
    margin: 0;
    opacity: 0;
    visibility: hidden;
    z-index: calc(var(--vbk--navbar-z-index) + 1);
    border-radius: 0.15rem;
    box-shadow: var(--vbk--elevation-medium);
    min-width: 10rem;
    border: var(--vbk--menu-border);
    background-color: var(--vbk--menu-bg-color);
    transition: var(--vbk--menu-transition);
  }

  .nav-item.open .nav-item__menu {
    opacity: 1;
    visibility: visible;
  }
}
</style>
