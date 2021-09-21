<script setup lang="ts">
import { PageView, usePage } from '@vitebook/client';

const page = usePage();
</script>

<template>
  <main class="page" :class="{ [`type-${page?.type}`]: page?.type }">
    <div class="page__container">
      <slot name="start" />
      <PageView class="page__view" :shadow="page?.type === 'story'" />
      <slot name="end" />
    </div>
  </main>
</template>
