<script context="module">
  import { createSvelteViewRenderer } from './renderer';

  /** @type {import('vitebook').ConfigureApp} */
  export function configureApp({ renderers }) {
    renderers.push(createSvelteViewRenderer());
  }
</script>

<script>
  import PageLayouts from './components/PageLayouts.svelte';
  import PageView from './components/PageView.svelte';
</script>

<PageLayouts>
  <PageView />
</PageLayouts>
