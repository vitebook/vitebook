<script>
  import { getPage } from '../context';

  const page = getPage();

  export let index = 0;

  $: layout = $page.layouts[index];
</script>

{#if index < $page.layouts.length}
  <svelte:component this={layout.default} {...layout.data}>
    <svelte:self index={index + 1}>
      <slot />
    </svelte:self>
  </svelte:component>
{:else}
  <slot />
{/if}
