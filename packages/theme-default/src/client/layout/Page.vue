<script setup lang="ts">
import { PageView, usePage } from '@vitebook/client';

const page = usePage();
</script>

<template>
  <main class="page" :class="{ [`type-${page?.type}`]: page?.type }">
    <div class="page__container">
      <slot name="start" />
      <PageView :shadow="page?.type === 'vue'" />
      <slot name="end" />
    </div>
  </main>
</template>
