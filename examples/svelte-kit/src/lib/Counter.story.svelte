<script lang="ts" context="module">
  import type { PageMeta } from '@vitebook/client';

  export const __pageMeta: PageMeta = {
    title: 'Counter',
    description: 'My counter component.',
  };
</script>

<script>
  import { Variant } from '@vitebook/client';

  import Counter from './Counter.svelte';
</script>

<Variant name="Default">
  <div style="--text-color: black; --secondary-color: white;">
    <Counter />
  </div>
</Variant>
