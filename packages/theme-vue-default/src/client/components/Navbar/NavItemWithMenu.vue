<script setup lang="ts">
import { NavItemWithMenu } from '@vitebook/core/shared';
import { computed, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

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
}

.nav-menu.menu-open {
  height: auto;
}

.menu-button {
  width: 100%;
  border: 0;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1.4;
  font-weight: 500;
  padding: 0.68rem 0.5rem;
  color: var(--color-text);
  background-color: transparent;
  text-align: left;
  white-space: nowrap;
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
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-item {
  border-radius: 0.12rem;
  padding: 0.68rem 0.5rem;
}

.menu-item :deep(.nav-link) {
  margin-left: 1rem;
}

.menu-item :deep(.link) {
  margin: 0;
  padding: 0;
  font-size: 1rem;
  font-weight: 400;
}

@media (hover: hover) {
  .menu-button:hover {
    background-color: var(--color-bg-100);
  }

  .menu-item:hover {
    background-color: var(--color-bg-100);
  }

  .menu-item :deep(.link:hover:not(.active) > .link-text) {
    border-bottom: 0;
  }

  .nav-menu:hover .menu {
    display: block;
  }
}

@media (pointer: coarse), (min-width: 992px) {
  .menu-button:hover {
    background-color: transparent;
  }
}

@media (min-width: 992px) {
  .nav-menu {
    height: auto;
    overflow: visible;
  }

  .menu-button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
  }

  .menu-button-arrow,
  .menu-open .menu-button-arrow {
    transform: translateY(0.1rem);
  }

  .menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 1rem;
    padding: 0.8rem;
    z-index: calc(var(--navbar-z-index) + 1);
    border-radius: 0.125rem;
    min-width: 10rem;
    border: 0.12rem solid var(--color-divider);
    background-color: var(--color-bg-200);
  }

  .menu-item {
    padding: 0.75rem 1rem;
    margin: 0;
  }

  .menu-item:first-child {
    margin-top: 0;
  }

  .menu-item :deep(.nav-link) {
    margin-left: 0;
  }
}
</style>
