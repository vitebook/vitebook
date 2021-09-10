<script setup lang="ts">
import HomeFeatures from './HomeFeatures.vue';
import HomeFooter from './HomeFooter.vue';
import HomeHero from './HomeHero.vue';
</script>

<template>
  <main class="home" aria-labelledby="main-title">
    <slot name="before-hero" />
    <HomeHero />
    <slot name="after-hero" />
    <HomeFeatures />
    <slot name="after-features" />
    <HomeFooter />
    <slot name="after-footer" />
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  min-height: calc(100vh - var(--navbar-height));
  background-color: var(--color-bg-200);
}
</style>
