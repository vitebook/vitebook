<script setup lang="ts">
import { NavItemWithMenu } from '@vitebook/core/shared';
import { computed, ref, toRefs, watch } from 'vue';
import { useRoute } from 'vue-router';

import NavMenuArrow from './NavMenuArrow.vue';
import NavMenuItem from './NavMenuItem.vue';

const props = defineProps<{
  item: NavItemWithMenu;
}>();

const propsRef = toRefs(props);
const route = useRoute();
const isOpen = ref(false);

watch(
  () => route.path,
  () => {
    isOpen.value = false;
  }
);

const navItem = ref<HTMLElement | null>(null);
const menuController = ref<HTMLElement | null>(null);

const menuId = computed(
  () => `nav-menu-${propsRef.item.value.text.replace(/\s/g, '-').toLowerCase()}`
);

const menuControllerId = computed(
  () =>
    `nav-menu-controller-${propsRef.item.value.text
      .replace(/\s/g, '-')
      .toLowerCase()}`
);

function onToggle() {
  isOpen.value = !isOpen.value;
}

// TODO: poor man's accessbility, fix later.
function onKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) return;

  if (e.key === 'Esc' || e.key === 'Escape') {
    isOpen.value = false;
    menuController.value?.focus();
  } else if (e.key === 'Tab') {
    window.requestAnimationFrame(() => {
      if (!navItem.value?.contains(document.activeElement)) {
        isOpen.value = false;
      }
    });
  }
}
</script>

<template>
  <div
    ref="navItem"
    class="nav-item"
    :class="{ open: isOpen }"
    @pointerenter="isOpen = true"
    @pointerleave="isOpen = false"
    @keydown="onKeyDown"
  >
    <button
      :id="menuControllerId"
      ref="menuController"
      class="menu-controller"
      :aria-label="item.ariaLabel"
      :aria-controls="menuId"
      aria-haspopup="true"
      @click="onToggle"
    >
      <span class="menu-controller-text">{{ item.text }}</span>
      <NavMenuArrow class="menu-controller-arrow" :is-open="isOpen" />
    </button>

    <ul
      :id="menuId"
      class="menu"
      :aria-labelledby="menuControllerId"
      :aria-expanded="isOpen"
    >
      <li v-for="menuItem in item.menu" :key="menuItem.text" class="menu-item">
        <NavMenuItem :item="menuItem" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-item {
  position: relative;
  height: 2.25rem;
  overflow: hidden;
  cursor: pointer;
}

@media (min-width: 992px) {
  .nav-item {
    height: auto;
    overflow: visible;
  }

  .nav-item.open .menu {
    display: block;
  }
}

.nav-item.open {
  height: auto;
}

.menu-controller {
  border: 0;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  background-color: transparent;
  text-align: left;
  white-space: nowrap;
}

.menu-controller:focus-visible .menu-controller-text {
  border-bottom: 0.12rem solid var(--color-primary);
}

.menu-controller-text {
  margin-right: 0.1rem;
}

.menu-controller-arrow {
  margin-top: 0.1rem;
}

.menu {
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-item {
  padding: 0.2rem 0;
}

@media (min-width: 992px) {
  .menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 1rem;
    padding: 0.8rem;
    z-index: calc(var(--navbar-z-index) + 1);
    border-radius: 0.125rem;
    min-width: 8.56rem;
    border: 0.12rem solid var(--color-divider);
    background-color: var(--color-bg-200);
  }
}
</style>
