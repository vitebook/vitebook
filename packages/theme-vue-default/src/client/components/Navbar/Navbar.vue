<script setup lang="ts">
import HamburgerIcon from './HamburgerIcon.vue';
import NavbarTitle from './NavbarTitle.vue';
import NavLinks from './NavLinks.vue';

defineEmits(['toggle']);
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="navbar-left">
        <button class="hamburger-button" @click="$emit('toggle')">
          <HamburgerIcon class="hamburger-icon" />
        </button>

        <NavbarTitle />
      </div>

      <div class="flex-grow" />

      <div class="nav">
        <NavLinks />
      </div>

      <slot />
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
  padding: 0 1.25rem;
}

.flex-grow {
  flex-grow: 1;
}

.nav {
  display: none;
}

@media (min-width: 992px) {
  .nav {
    display: block;
  }
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
  margin-right: 0.5rem;
  padding: 0.5rem;
  border: 0;
  border-radius: 0.125rem;
  cursor: pointer;
  background-color: transparent;
}

.hamburger-button:hover,
.hamburger-button:focus-visible {
  outline: 0;
  background-color: var(--color-bg-100);
}

@media (min-width: 992px) {
  .hamburger-button {
    display: none;
  }
}
</style>
