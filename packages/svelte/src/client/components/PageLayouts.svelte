<script>
  import { page } from '@vitebook/core';

  export let index = 0;

  $: layout = $page.layouts[index];
</script>

{#if index < $page.layouts.length}
  <svelte:component this={layout.default}>
    <svelte:self index={index + 1}>
      <slot />
    </svelte:self>
  </svelte:component>
{:else}
  <slot />
{/if}
