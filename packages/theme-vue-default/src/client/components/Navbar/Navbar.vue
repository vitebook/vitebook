<script setup lang="ts">
import NavbarTitle from './NavbarTitle.vue';
import NavLinks from './NavLinks.vue';
</script>

<template>
  <header class="navbar">
    <div class="container">
      <NavbarTitle />

      <div class="flex-grow" />

      <div class="nav">
        <NavLinks />
      </div>
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
  border-bottom: 0.1rem solid var(--color-divider);
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
</style>
