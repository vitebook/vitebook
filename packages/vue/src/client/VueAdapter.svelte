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
  import { currentRoute } from '@vitebook/client';
  import { onDestroy } from 'svelte';
  import { createApp, createSSRApp } from 'vue';

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
    app.mount(target);
  }

  function destroy() {
    app?.unmount();
    app = undefined;
  }
</script>

<div bind:this={target} />
