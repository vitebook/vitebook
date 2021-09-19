<script setup lang="ts">
import { useIsScrimActive } from './useScrim';

const isScrimActive = useIsScrimActive();
</script>

<template>
  <button
    class="scrim"
    :class="{ active: isScrimActive }"
    aria-label="Close scrim"
  ></button>
</template>

<style scoped>
.scrim {
  border: 0;
  margin: 0;
  padding: 0;
  position: fixed;
  inset: 0;
  z-index: var(--scrim-z-index);
  display: block;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-100);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.35s ease;
}

.scrim.active {
  opacity: 0.9;
  visibility: visible;
}
</style>
