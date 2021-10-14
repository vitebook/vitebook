<script>
  import { inBrowser } from '@vitebook/core/shared';
  import PageView from './components/PageView.svelte';
  import { useUpdateHead } from './composables/useUpdateHead';
  import { siteLang } from './stores/siteLang';
  import { theme } from './stores/theme';

  useUpdateHead();

  $: if (inBrowser) document.documentElement.lang = $siteLang;
</script>

<svelte:component this={$theme.Layout} />
