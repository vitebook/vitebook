<script lang="ts" context="module">
  import type { PageMeta } from '@vitebook/client';

  export const __pageMeta: PageMeta = {
    title: 'Button',
    description: 'My awesome button.',
  };
</script>

<script>
  import { Variant } from '@vitebook/client';
  import Button from './Button.svelte';
</script>

<Variant name="Default" description="The default button.">
  <Button />
</Variant>

<Variant name="Disabled" description="The disabled button.">
  <Button disabled />
</Variant>
