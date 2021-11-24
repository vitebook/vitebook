<script>
  import { COMPONENT_SSR_CTX_KEY, useAppContext } from '@vitebook/client';
  import { h, hydrate as preactHydrate, render as preactRender } from 'preact';
  import { onDestroy } from 'svelte';
  import App from ':virtual/vitebook/preact/app';

  const isSSR = import.meta.env.SSR;

  let target;

  export let component;

  onDestroy(() => {
    destroy();
  });

  $: if (target) {
    mount(component);
  }

  function createNewApp() {
    return h(App, { component: h(component, {}) });
  }

  function mount(component) {
    destroy();
    if (!component) return;
    if (import.meta.env.PROD) {
      preactHydrate(createNewApp(), target);
    } else {
      preactRender(createNewApp(), target);
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
      ssr = renderToString(createNewApp());
      const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
      ssrContext[ssrId] = {};
    }
  }
</script>

<div bind:this={target}>
  {#if isSSR}
    {@html ssr}
  {/if}
</div>
