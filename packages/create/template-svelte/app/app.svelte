<script context="module">
  /** @type {import('vitebook').ConfigureApp} */
  export function configureApp({ router }) {
    // ...
  }
</script>

<script>
  import './global.css';

  import { PageLayouts, PageView } from '@vitebook/svelte';
</script>

<PageLayouts>
  <PageView />
</PageLayouts>
