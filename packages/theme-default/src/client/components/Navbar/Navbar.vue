<script setup lang="ts">
import NavbarTitle from './NavbarTitle.vue';
import NavLinks from './NavLinks.vue';
</script>

<template>
  <header class="navbar">
    <div class="navbar__container">
      <slot name="start" />

      <NavbarTitle />

      <div class="flex-grow" />

      <NavLinks />

      <slot name="end" />
    </div>
  </header>
</template>
