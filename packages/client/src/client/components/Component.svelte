<script>
  import { getAllContexts } from 'svelte';
  import { PAGE_SSR_CTX_KEY } from '../context/context-keys';

  let target;
  let shadowRoot;
  let currentComponent;

  export let component = undefined;
  export let shadow = false;

  const context = getAllContexts();

  $: if (target) {
    const root = document.createElement('div');
    root.classList.add('shadow-root');
    shadowRoot = root.attachShadow({ mode: 'open' });
    target.appendChild(root);
  }

  $: if (shadowRoot && component) {
    currentComponent?.$destroy();
    currentComponent = new component({
      target: shadow ? shadowRoot : target,
      context,
      hydrate: import.meta.env.PROD
    });
  } else {
    currentComponent?.$destroy();
    currentComponent = undefined;
  }

  let ssr;
  if (import.meta.env.SSR) {
    if (component) {
      // @ts-expect-error - no server side types
      ssr = component.render({}, { context });
      Object.assign(context.get(PAGE_SSR_CTX_KEY), {
        [Symbol('__VITEBOOK_MODULE_ID__')]: ssr
      });
    }
  }
</script>

{#if import.meta.env.SSR}
  {@html ssr.html}
{:else}
  <div bind:this={target} />
{/if}
