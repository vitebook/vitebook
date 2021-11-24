<script lang="ts">
import type { App, Component } from 'vue';

export async function configureApp(app: App) {
  //
}
</script>

<script setup lang="ts">
const { component } = defineProps<{
  component: Component;
}>();
</script>

<template>
  <component :is="component" />
</template>
