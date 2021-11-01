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
  import { isFunction } from '@vitebook/core';
  import { currentRoute } from '@vitebook/client';
  import VueAdapter from './VueAdapter.svelte';

  $: component = cache.get($currentRoute.decodedPath);
</script>

<VueAdapter {component} />
