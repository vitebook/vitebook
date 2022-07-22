<script>
  import {
    SSR_CTX_KEY,
    COMPONENT_SSR_CTX_KEY,
    useAppContext,
  } from '@vitebook/client';
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
    return h(App, { Component: component });
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

  let ssrId = isSSR ? Math.random().toString(16).slice(2) : '';
  let ssrMarker = isSSR ? `<!--${ssrId}-->` : '';

  if (isSSR) {
    if (component) {
      const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
      ssrContext[ssrId] = {
        // We pass this render function back up to the server entry file because top-level await
        // is not supported in Svelte yet.
        async render() {
          const render = (await import('preact-render-to-string')).default;
          const html = render(createNewApp());
          return [ssrMarker, html];
        },
      };
    }
  }
</script>

<div bind:this={target}>
  {#if isSSR}
    {@html ssrMarker}
  {/if}
</div>
