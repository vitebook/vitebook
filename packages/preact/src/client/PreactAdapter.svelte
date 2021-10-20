<script context="module">
  const cache = new Map();

  export const __pageMeta = async (page, mod) => {
    if (!page.context?.loader) return {};

    const contextMod = await page.context.loader();
    cache.set(decodeURI(page.route), contextMod.default);

    return isFunction(contextMod.__pageMeta)
      ? contextMod.__pageMeta(page, mod)
      : contextMod.__pageMeta;
  };
</script>

<script>
  import { isFunction } from '@vitebook/core/shared';
  import {
    COMPONENT_SSR_CTX_KEY,
    currentRoute,
    useAppContext
  } from '@vitebook/client';
  import { h, hydrate as preactHydrate, render as preactRender } from 'preact';
  import { onDestroy } from 'svelte';

  let target;

  onDestroy(() => {
    destroy();
  });

  $: if (target) {
    const Component = cache.get($currentRoute.decodedPath);
    mount(Component);
  }

  function mount(Component) {
    destroy();

    if (!Component) return;

    if (import.meta.env.PROD) {
      preactHydrate(h(Component, {}), target);
    } else {
      preactRender(h(Component, {}), target);
    }
  }

  function destroy() {
    if (!target) return;
    preactRender(null, target);
  }

  let ssr = '';
  let ssrId = import.meta.env.SSR ? Math.random().toString(16).slice(2) : '';

  if (import.meta.env.SSR) {
    const Component = cache.get($currentRoute.decodedPath);
    const renderToString = require('preact-render-to-string');
    // @ts-expect-error - .
    ssr = renderToString(h(Component, {}));
    const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
    ssrContext[ssrId] = {};
  }
</script>

<div bind:this={target}>
  {#if import.meta.env.SSR}
    {@html ssr}
  {/if}
</div>
