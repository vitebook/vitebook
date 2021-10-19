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
    preactRender(null, target);
  }
</script>

<div bind:this={target} />
