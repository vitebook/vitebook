<script context="module">
  import { createSvelteViewRenderer } from '@vitebook/svelte';

  /** @type {import('@vitebook/core').ConfigureApp} */
  export function configureApp({ renderers }) {
    renderers.push(createSvelteViewRenderer());
  }
</script>

<script>
  import '$src/global.css';

  import { PageLayouts, PageView } from '@vitebook/svelte';
</script>

<PageLayouts>
  <PageView />
</PageLayouts>
