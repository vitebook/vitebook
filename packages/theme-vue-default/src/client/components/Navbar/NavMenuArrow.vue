<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();
</script>

<template>
  <svg
    aria-labelledby="nav-menu-arrow-svg-title"
    role="img"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title id="nav-menu-arrow-svg-title">A small arrow</title>
    <path
      :class="{ open: isOpen }"
      d="M8 12.6667L3 6H13L8 12.6667Z"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
path {
  stroke: currentColor;
  fill: transparent;
  color: var(--color-black);
}

path.open {
  fill: var(--color-primary);
}

html.dark path {
  color: var(--color-white);
}

html.dark path.open {
  color: var(--color-primary);
  fill: transparent;
}
</style>
