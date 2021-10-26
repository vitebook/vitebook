import { activeVariant, variants } from '@vitebook/client';
import { get } from 'svelte/store';
import { onBeforeUnmount, readonly, ref } from 'vue';

export function useVariants() {
  const variantsRef = ref(get(variants));

  const unsub = variants.subscribe(($v) => {
    variantsRef.value = { ...$v };
  });

  onBeforeUnmount(() => {
    unsub();
  });

  return readonly(variantsRef);
}

export function useActiveVariant() {
  const activeVariantRef = ref(get(activeVariant));

  const unsub = activeVariant.subscribe(($v) => {
    activeVariantRef.value = $v ? { ...$v } : undefined;
  });

  onBeforeUnmount(() => {
    unsub();
  });

  return readonly(activeVariantRef);
}
