<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean;
}>();
</script>

<template>
  <button :disabled="disabled">Click Me</button>
</template>
