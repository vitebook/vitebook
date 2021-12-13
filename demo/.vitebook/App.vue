<script lang="ts">
import type { App } from 'vue';
import { Lazyload } from 'vant';

export function configureApp(app: App) {
  app.use(Lazyload);
}
</script>

<script setup lang="ts">
import type { Component } from 'vue';

const { component } = defineProps<{
  component: Component;
}>();
</script>

<template>
  <component :is="component" />
</template>
