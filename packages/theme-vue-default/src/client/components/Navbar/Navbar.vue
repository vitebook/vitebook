<script setup lang="ts">
import HamburgerIcon from './HamburgerIcon.vue';
import NavbarTitle from './NavbarTitle.vue';
import NavLinks from './NavLinks.vue';

defineEmits(['hamburger-click']);
</script>

<template>
  <header class="navbar">
    <div class="container">
      <slot name="start" />

      <div class="navbar-left">
        <button
          class="hamburger-button"
          @pointerdown="$emit('hamburger-click')"
          @keydown.enter="$emit('hamburger-click')"
        >
          <div>
            <HamburgerIcon class="hamburger-icon" />
          </div>
        </button>

        <NavbarTitle />
      </div>

      <div class="flex-grow" />

      <div class="nav">
        <NavLinks />
      </div>

      <slot name="end" />
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: var(--navbar-z-index);
  border-bottom: 0.12rem solid var(--color-divider);
  height: var(--navbar-height);
  background-color: var(--color-bg-200);
}

.container {
  width: 100%;
  height: var(--navbar-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 1.25rem;
}

.flex-grow {
  flex-grow: 1;
}

.nav {
  display: none;
}

.navbar-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.hamburger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  margin-right: 0.25rem;
  padding-left: 1rem;
  border: 0;
  border-radius: 0.125rem;
  cursor: pointer;
  background-color: transparent;
}

.hamburger-button > div {
  padding: 0.5rem;
}

@media (hover: hover) and (pointer: fine) {
  .hamburger-button:hover > div {
    background-color: var(--color-bg-100);
  }
}

@media (min-width: 992px) {
  .nav {
    display: block;
  }

  .container {
    padding-left: 1.25rem;
  }

  .hamburger-button {
    display: none;
    padding-left: 1.25rem;
  }
}
</style>
