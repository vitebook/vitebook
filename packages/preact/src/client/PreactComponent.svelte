<script>
  import { COMPONENT_SSR_CTX_KEY, useAppContext } from '@vitebook/client';
  import { h, hydrate as preactHydrate, render as preactRender } from 'preact';
  import { onDestroy } from 'svelte';

  let target;
  let component;

  export { component as this };

  onDestroy(() => {
    destroy();
  });

  $: if (target) {
    mount(component);
  }

  function mount(component) {
    destroy();
    if (!component) return;
    if (import.meta.env.PROD) {
      preactHydrate(h(component, {}), target);
    } else {
      preactRender(h(component, {}), target);
    }
  }

  function destroy() {
    if (!target) return;
    preactRender(null, target);
  }

  let ssr = '';
  let ssrId = import.meta.env.SSR ? Math.random().toString(16).slice(2) : '';

  if (import.meta.env.SSR) {
    if (component) {
      const renderToString = require('preact-render-to-string');
      // @ts-expect-error - .
      ssr = renderToString(h(component, {}));
      const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
      ssrContext[ssrId] = {};
    }
  }
</script>

<div bind:this={target}>
  {#if import.meta.env.SSR}
    {@html ssr}
  {/if}
</div>
