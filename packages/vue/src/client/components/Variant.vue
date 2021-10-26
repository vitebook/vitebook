<script setup lang="ts">
import { inBrowser } from '@vitebook/core/shared';

import { onMounted, onBeforeUnmount } from 'vue';
import { variants } from '@vitebook/client';
import { useActiveVariant, useVariants } from '../composables/useVariants';

const props = defineProps<{
  name: string;
  description?: string;
}>();

const variantId = encodeURI(`${props.name}`.toLowerCase());

const searchParams = inBrowser
  ? new URL(location.href).searchParams
  : undefined;

const $variants = useVariants();
const $activeVariant = useActiveVariant();

const variant = {
  id: variantId,
  name: `${props.name}`,
  description: props.description,
  active: import.meta.env.SSR
    ? Object.values($variants.value).length === 0 ||
      Object.values($variants.value).findIndex((v) => v.id === variantId) === 0
    : searchParams?.get('variant')?.toLowerCase() === variantId
};

variants.add(variant);

onMounted(() => {
  if (!$activeVariant.value) {
    const variations = Object.values($variants.value);
    variants.setActive(variations[0].id);
  } else if ($activeVariant.value) {
    // Simply updating query string and other information.
    variants.setActive($activeVariant.value.id);
  }
});

onBeforeUnmount(() => {
  variants.delete(variantId);
});
</script>

<template>
  <slot v-if="$variants[variantId].active" />
</template>
