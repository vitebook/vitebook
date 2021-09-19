<script setup lang="ts">
import HomeFeatures from './HomeFeatures.vue';
import HomeFooter from './HomeFooter.vue';
import HomeHero from './HomeHero.vue';
</script>

<template>
  <slot name="before-hero" />
  <HomeHero />
  <slot name="after-hero" />
  <HomeFeatures />
  <slot name="after-features" />
  <HomeFooter />
  <slot name="after-footer" />
</template>
