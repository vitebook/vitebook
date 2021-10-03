<script lang="ts">
const cache = new Map<string, typeof SvelteComponent>();

export const __pageMeta = async (
  page: SveltePage,
  mod: SveltePageModule
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
import type { SvelteComponent } from 'svelte';
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import type { SveltePage, SveltePageModule } from '../shared';
import { ROUTER_CONTEXT_KEY } from './context';

const target = ref();
const router = useRouter();
const hasMounted = ref(false);

const svelteContext = new Map();
svelteContext.set(ROUTER_CONTEXT_KEY, router);

let currentComponent: SvelteComponent | undefined;

onMounted(async () => {
  hasMounted.value = true;
});

onBeforeUnmount(() => {
  destroy();
  hasMounted.value = false;
});

function mount(Component?: typeof SvelteComponent) {
  if (!Component) return;
  destroy();
  currentComponent = new Component({
    target: target.value,
    context: svelteContext,
    hydrate: import.meta.env.PROD
  });
}

function destroy() {
  currentComponent?.$destroy();
  currentComponent = undefined;
}

watchEffect(() => {
  if (!hasMounted.value) return;
  const Component = cache.get(router.currentRoute.value.path);
  mount(Component);
});
</script>

<template>
  <div v-pre>
    <div ref="target"></div>
  </div>
</template>
