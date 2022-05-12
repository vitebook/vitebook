<script>
  import { page } from '../stores/page';

  export let index = 0;

  $: layout = $page.layouts[index];
</script>

{#if index < $page.layouts.length}
  <svelte:component this={layout.component}>
    <svelte:self index={index + 1}>
      <slot />
    </svelte:self>
  </svelte:component>
{:else}
  <slot />
{/if}
