<script>
  import { inBrowser } from '@vitebook/core';
  import { useUpdateHead } from './composables/useUpdateHead';
  import { siteLang } from './stores/siteLang';
  import { theme } from './stores/theme';

  useUpdateHead();

  $: if (inBrowser) document.documentElement.lang = $siteLang;
</script>

{#if 'adapter' in $theme.Layout}
  <svelte:component
    this={$theme.Layout.adapter}
    component={$theme.Layout.component}
  />
{:else}
  <svelte:component this={$theme.Layout} />
{/if}
