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
