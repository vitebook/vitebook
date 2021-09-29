<script setup lang="ts">
import { PageView, usePage } from '@vitebook/client';
import { inBrowser } from '@vitebook/core/shared';
import { computed, defineAsyncComponent } from 'vue';

import { useIsMarkdownFloatingTocEnabled } from '../components/markdown/useMarkdownFloatingToc';
import { useRouterScroll } from '../composables/useRouterScroll';

const page = usePage();

const routerScroll = useRouterScroll();

async function onBeforeLeave() {
  await routerScroll.pending;
  if (!inBrowser) return;
  document.body.classList.add('page-transition');
}

async function onBeforeEnter() {
  await routerScroll.resolve();
}

async function onAfterEnter() {
  if (!inBrowser) return;
  window.requestAnimationFrame(() => {
    document.body.classList.remove('page-transition');
  });
}

const isMarkdownPage = computed(() => page.value?.type.includes('md'));
const isMarkdownFloatingTocEnabled = useIsMarkdownFloatingTocEnabled();

const MarkdownFooter = defineAsyncComponent(
  () => import('../components/markdown/MarkdownFooter.vue')
);

const MarkdownFloatingToc = defineAsyncComponent(
  () => import('../components/markdown/MarkdownFloatingToc.vue')
);

const hasShadowRoot = computed(() =>
  /^(html|svg|vue)$/.test(page.value?.type ?? '')
);
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
        <PageView :shadow="hasShadowRoot" />
      </Transition>
      <MarkdownFooter v-if="isMarkdownPage" />
      <MarkdownFloatingToc
        v-if="isMarkdownPage && isMarkdownFloatingTocEnabled"
      />
      <slot name="end" />
    </div>
  </main>
</template>

<style>
.page {
  position: relative;
  margin: 0;
  min-height: 100vh;
  padding-top: calc(var(--vbk--navbar-height) + 1rem);
  flex: none;
  width: 100%;
}

.page[class~='type-md'],
.page[class~='type-vue:md'],
.page[class~='type-vue'] {
  background-color: var(--vbk--page-md-bg-color);
}

.page[class~='type-vue'],
.page[class~='type-html'],
.page[class~='type-svg'] {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.page__container {
  width: 100%;
}

.page[class~='type-md'] > .page__container,
.page[class~='type-vue:md'] > .page__container {
  margin: 0 auto;
  max-width: 48rem;
  padding: 0 2rem 4rem;
  padding-bottom: calc(var(--vbk--navbar-height) * 3.5);
}

.page[class~='type-vue'] > .page__container,
.page[class~='type-html'] > .page__container,
.page[class~='type-svg'] > .page__container {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-2rem) translateZ(0);
}

@media (min-width: 992px) {
  .page {
    flex: 1 0 0;
    width: auto;
  }

  html.no-navbar .page[class~='type-md'] > .page__container,
  html.no-navbar .page[class~='type-vue:md'] > .page__container {
    margin-top: 1.5rem;
    padding-bottom: 4rem;
  }
}
</style>
