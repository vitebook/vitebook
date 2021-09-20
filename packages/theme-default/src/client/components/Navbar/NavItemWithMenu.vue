<script setup lang="ts">
import { inBrowser } from '@vitebook/core/shared';
import { computed, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

import type { NavItemWithMenu } from '../../../shared';
import NavItemLink from './NavItemLink.vue';
import NavMenuArrow from './NavMenuArrow.vue';

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
    class="nav-menu"
    :class="{ 'menu-open': isMenuOpen }"
    @keydown="onKeyDown"
  >
    <button
      :id="menuButtonId"
      ref="menuButton"
      class="menu-button"
      :aria-label="item.ariaLabel"
      :aria-controls="menuId"
      aria-haspopup="true"
      @pointerdown="onToggle"
      @keydown.enter="onToggle"
    >
      <span class="menu-button-text">{{ item.text }}</span>
      <NavMenuArrow class="menu-button-arrow" :is-open="isMenuOpen" />
    </button>

    <ul
      :id="menuId"
      class="menu"
      :aria-labelledby="menuButtonId"
      :aria-expanded="isMenuOpen"
      @pointerleave="onMenuPointerLeave"
    >
      <li v-for="menuItem in item.menu" :key="menuItem.text" class="menu-item">
        <NavItemLink :item="menuItem" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-menu {
  position: relative;
  height: 2.72rem;
  overflow: hidden;
  cursor: pointer;
  width: 100%;
}

.nav-menu.menu-open {
  height: auto;
}

.menu-button-arrow {
  padding-left: 0.12rem;
  transform: rotate(270deg) translateX(-0.25rem);
  transform-origin: center;
}

.menu-open .menu-button-arrow {
  transform: translateY(0.1rem);
}

.menu {
  margin-left: 1rem;
}

@media (hover: hover) {
  .menu-item:hover {
    background-color: var(--color-bg-100);
  }

  .menu-item :deep(.link:hover:not(.active) > span) {
    border-bottom: 0;
  }

  .nav-menu:hover .menu {
    display: block;
  }
}

@media (min-width: 992px) {
  .nav-menu {
    height: auto;
    overflow: visible;
  }

  .menu-button-arrow,
  .menu-open .menu-button-arrow {
    transform: translateY(0);
  }

  .menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 1rem;
    padding: 0.8rem;
    margin: 0;
    z-index: calc(var(--navbar-z-index) + 1);
    border-radius: 0.125rem;
    min-width: 10rem;
    border: 0.12rem solid var(--color-divider);
    background-color: var(--color-bg-200);
  }

  .nav-menu.menu-open .menu {
    display: block;
  }

  .menu-item {
    padding: 0.375rem 0;
  }

  :deep(.menu-item a) {
    margin-top: 0;
  }
}
</style>
