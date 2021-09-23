<script setup lang="ts">
import { PageView, usePage } from '@vitebook/client';
import { inBrowser } from '@vitebook/core/shared';

import { useScrollPromise } from '../composables/useScrollPromise';

const page = usePage();

const scrollPromise = useScrollPromise();

async function onBeforeLeave() {
  await scrollPromise.pending;
  if (!inBrowser) return;
  document.body.classList.add('page-transition');
}

async function onBeforeEnter() {
  await scrollPromise.resolve();
}

async function onAfterEnter() {
  if (!inBrowser) return;
  window.requestAnimationFrame(() => {
    document.body.classList.remove('page-transition');
  });
}
</script>

<template>
  <main class="page" :class="{ [`type-${page?.type}`]: page?.type }">
    <div class="page__container">
      <slot name="start" />
      <Transition
        name="page-transition"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @before-enter="onBeforeEnter"
        @after-enter="onAfterEnter"
      >
        <PageView :shadow="page?.type === 'vue'" />
      </Transition>
      <slot name="end" />
    </div>
  </main>
</template>
