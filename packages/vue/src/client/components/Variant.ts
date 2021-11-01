import { variants } from '@vitebook/client';
import { inBrowser } from '@vitebook/core';
import { defineComponent, onBeforeUnmount, onMounted } from 'vue';

import { useActiveVariant, useVariants } from '../composables/useVariants';

export type VariantProps = {
  name: string;
  description?: string;
};

export default defineComponent<VariantProps>({
  setup(props) {
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
          Object.values($variants.value).findIndex(
            (v) => v.id === variantId
          ) === 0
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

    return { $variants, variantId };
  },
  render({ $variants, variantId }) {
    return $variants[variantId].active ? this.$slots.default?.() : null;
  }
});
