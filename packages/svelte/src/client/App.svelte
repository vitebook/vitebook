<script context="module">
  /** @type {import('vitebook').ConfigureApp} */
  export function configureApp() {}
</script>

<script>
  import PageLayouts from './components/PageLayouts.svelte';
  import PageView from './components/PageView.svelte';
</script>

<PageLayouts>
  <PageView />
</PageLayouts>
