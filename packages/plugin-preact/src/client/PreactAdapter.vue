<script lang="ts">
const cache = new Map<string, FunctionComponent>();

export const __pageMeta = async (
  page: PreactPage,
  mod: PreactPageModule
): Promise<PageMeta> => {
  if (!page.context?.loader) return {};

  const contextMod = await page.context.loader();
  cache.set(page.route, contextMod.default);

  return isFunction(contextMod.__pageMeta)
    ? contextMod.__pageMeta(page, mod)
    : contextMod.__pageMeta;
};
</script>

<script setup lang="ts">
import { isFunction, PageMeta } from '@vitebook/core/shared';
import { FunctionComponent, hydrate, render } from 'preact';
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import type { PreactPage, PreactPageModule } from '../shared';
import { withRouter } from './withRouter';

const target = ref();
const router = useRouter();
const hasMounted = ref(false);

onMounted(async () => {
  hasMounted.value = true;
});

onBeforeUnmount(() => {
  destroy();
  hasMounted.value = false;
});

function mount(Component?: FunctionComponent) {
  if (!Component) return;
  destroy();
  if (import.meta.env.PROD) {
    hydrate(withRouter({ Component, router }), target.value);
  } else {
    render(withRouter({ Component, router }), target.value);
  }
}

function destroy() {
  render(null, target.value);
}

watchEffect(() => {
  if (!hasMounted.value) return;
  const Component = cache.get(router.currentRoute.value.path);
  mount(Component);
});
</script>

<template>
  <div v-pre ref="target"></div>
</template>
