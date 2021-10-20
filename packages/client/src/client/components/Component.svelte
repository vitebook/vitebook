<script context="module">
  let hasHydrated = false;
</script>

<script>
  import { getAllContexts, tick } from 'svelte';
  import { COMPONENT_SSR_CTX_KEY } from '../context/context-keys';
  import { useAppContext } from '../context/useAppContext';

  let target;
  let shadowRootParent;
  let shadowRoot;
  let currentComponent;
  let component;
  let isShadowRootReady = false;

  export { component as this };
  export let shadow = false;

  const context = getAllContexts();

  $: if (target && shadowRootParent) {
    shadowRoot = shadowRootParent.attachShadow({ mode: 'open' });

    if (import.meta.env.PROD) {
      tick().then(() => {
        for (const child of Array.from(target.children)) {
          shadowRoot.appendChild(child.cloneNode(true));
        }

        while (target.firstChild) {
          target.firstChild.remove();
        }

        shadowRootParent.append(shadowRoot);
        isShadowRootReady = true;
      });
    } else {
      shadowRootParent.append(shadowRoot);
      isShadowRootReady = true;
    }
  }

  $: if (shadowRoot && component && isShadowRootReady) {
    currentComponent?.$destroy();
    currentComponent = new component({
      target: shadow ? shadowRoot : target,
      context,
      hydrate: import.meta.env.PROD && !hasHydrated
    });
    hasHydrated = true;
  } else {
    currentComponent?.$destroy();
    currentComponent = undefined;
  }

  let ssr;
  let ssrId = import.meta.env.SSR ? Math.random().toString(16).slice(2) : '';
  if (import.meta.env.SSR) {
    if (component) {
      // @ts-expect-error - no server side types
      ssr = component.render({}, { context });
      const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
      ssrContext[ssrId] = ssr;
    }
  }
</script>

<div>
  <div class="shadow-root" bind:this={shadowRootParent} />
  <div
    bind:this={target}
    class:not-ready={shadow && import.meta.env.PROD && !isShadowRootReady}
  >
    {#if import.meta.env.SSR}
      {@html ssr.html}
    {/if}
  </div>
</div>

<noscript>
  <style>
    .not-ready {
      opacity: 1 !important;
    }
  </style>
</noscript>

<style>
  .not-ready {
    opacity: 0;
  }
</style>
