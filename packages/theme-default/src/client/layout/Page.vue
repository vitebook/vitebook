<script setup lang="ts">
import { PageView, usePage } from '@vitebook/client';

const page = usePage();
</script>

<template>
  <main :class="{ [`${page?.type}`]: page?.type }">
    <div>
      <slot name="start" />
      <PageView />
      <slot name="end" />
    </div>
  </main>
</template>

<style scoped>
main {
  flex: 1 0 0;
  position: relative;
  margin: 0;
  min-height: 100vh;
  padding-top: var(--navbar-height);
  background-color: var(--color-bg-200);
}

main[class~='md'],
main[class~='vue:md'],
main[class~='story'] {
  background-color: var(--color-bg-100);
}

main[class~='story'] {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

main[class~='story'] > div {
  transform: translateY(-2rem);
}
</style>
