<script setup lang="ts">
import Navbar from '../components/Navbar/Navbar.vue';
import { initDarkMode } from '../composables/useDarkMode';
import Page from './Page.vue';

initDarkMode();
</script>

<template>
  <div>
    <Navbar />
    <Page />
  </div>
</template>
