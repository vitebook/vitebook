<script context="module">
  let hasHydrated = false;
</script>

<script>
  import { getAllContexts } from 'svelte';
  import { COMPONENT_SSR_CTX_KEY } from '../context/context-keys';
  import { useAppContext } from '../context/useAppContext';

  let target;
  let component;
  let currentComponent;

  const isSSR = import.meta.env.SSR;

  export { component as this };

  const context = getAllContexts();

  $: if (target && component) {
    currentComponent?.$destroy();
    currentComponent = new component({
      target,
      context,
      props: $$restProps,
      hydrate: import.meta.env.PROD && !hasHydrated,
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
      ssr = component.render($$restProps, { context });
      const ssrContext = useAppContext(COMPONENT_SSR_CTX_KEY);
      ssrContext[ssrId] = ssr;
    }
  }
</script>

<div bind:this={target}>
  {#if isSSR}
    {@html ssr.html}
  {/if}
</div>
