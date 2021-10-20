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
    currentRoute,
    COMPONENT_SSR_CTX_KEY,
    useAppContext,
    SSR_CTX_KEY
  } from '@vitebook/client';
  import { getContext, onDestroy } from 'svelte';
  import { createApp, createSSRApp, h } from 'vue';

  let target;
  let app;

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
    app = import.meta.env.PROD ? createSSRApp(Component) : createApp(Component);
    app.mount(target, import.meta.env.PROD);
  }

  function destroy() {
    app?.unmount();
    app = undefined;
  }

  let ssrId = import.meta.env.SSR ? Math.random().toString(16).slice(2) : '';
  let ssrMarker = import.meta.env.SSR ? `<!--${ssrId}-->` : '';

  if (import.meta.env.SSR) {
    const Component = cache.get($currentRoute.decodedPath);
    const { renderToString } = require('vue/server-renderer');
    const appSSrContext = useAppContext(SSR_CTX_KEY);
    const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
    ssrContext[ssrId] = {
      // We pass this render function back up to the server entry file because top-level await
      // is not supported in Svelte yet.
      async render() {
        const html = await renderToString(
          // Passing in app SSR context as Vue will automatically add component module id's
          // to the `module` set on it.
          h(Component),
          appSSrContext
        );
        return [ssrMarker, html];
      }
    };
  }
</script>

<div bind:this={target}>
  {#if import.meta.env.SSR}
    {@html ssrMarker}
  {/if}
</div>
