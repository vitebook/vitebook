<script>
  import { inBrowser } from '@vitebook/core/shared';

  import { onMount, onDestroy } from 'svelte';
  import { activeVariant, variants } from '../stores/variants';

  export let name;
  export let description = undefined;

  const variantId = encodeURI(`${name}`.toLowerCase());

  const searchParams = inBrowser
    ? new URL(location.href).searchParams
    : undefined;

  const variant = {
    id: variantId,
    name: `${name}`,
    description,
    active: import.meta.env.SSR
      ? Object.values($variants).length === 0 ||
        Object.values($variants).findIndex((v) => v.id === variantId) === 0
      : searchParams?.get('variant')?.toLowerCase() === variantId
  };

  variants.add(variant);

  onMount(() => {
    if (!$activeVariant) {
      const variations = Object.values($variants);
      variants.setActive(variations[0].id);
    } else {
      // Simply updating query string and other information.
      variants.setActive($activeVariant.id);
    }
  });

  onDestroy(() => {
    variants.delete(variantId);
  });

  $: active = $variants[variantId].active;
</script>

{#if active}
  <slot />
{/if}
