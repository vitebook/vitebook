<script setup lang="ts">
import Navbar from '../components/Navbar/Navbar.vue';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import { initDarkMode } from '../composables/useDarkMode';
import Page from './Page.vue';

initDarkMode();
</script>

<template>
  <div>
    <Navbar>
      <ThemeSwitch class="theme-switch" />
    </Navbar>

    <Page />
  </div>
</template>

<style scoped>
.theme-switch {
  display: none;
}

@media (min-width: 992px) {
  .theme-switch {
    display: block;
    margin-left: 0.2rem;
  }
}
</style>
