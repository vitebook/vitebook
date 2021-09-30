<script lang="ts">
let CurrentComponentCtor: typeof SvelteComponent | undefined;

const cache = new WeakMap<LoadedSveltePage, typeof SvelteComponent>();

export const __pageMeta = async (
  page: SveltePage,
  mod: SveltePageModule
): Promise<PageMeta> => {
  if (!page.context?.loader) return {};

  const svelteMod = await page.context.loader();

  CurrentComponentCtor = svelteMod.default;

  return isFunction(svelteMod.__pageMeta)
    ? svelteMod.__pageMeta(page, mod)
    : svelteMod.__pageMeta;
};
</script>

<script setup lang="ts">
import { isFunction, PageMeta } from '@vitebook/core/shared';
import type { SvelteComponent } from 'svelte';
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';

import type { LoadedSveltePage, SveltePage, SveltePageModule } from '../shared';
import { useSveltePage } from '.';

const target = ref();
const page = useSveltePage();
const hasMounted = ref(false);

let currentComponent: SvelteComponent | undefined;

onMounted(async () => {
  hasMounted.value = true;
});

onBeforeUnmount(() => {
  currentComponent?.$destroy();
  currentComponent = undefined;
});

function mount() {
  currentComponent?.$destroy();
  currentComponent = undefined;
  if (!CurrentComponentCtor) return;
  currentComponent = new CurrentComponentCtor({
    target: target.value,
    hydrate: import.meta.env.PROD
  });
}

watchEffect(() => {
  if (!hasMounted.value) return;

  if (page.value && cache.has(page.value)) {
    CurrentComponentCtor = cache.get(page.value);
  } else if (page.value && CurrentComponentCtor) {
    cache.set(page.value, CurrentComponentCtor);
  }

  mount();
});
</script>

<template>
  <div ref="target"></div>
</template>
