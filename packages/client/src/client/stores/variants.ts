import { inBrowser } from '@vitebook/core';
import { derived, writable } from 'svelte/store';

function updateSearchParam(variantId) {
  if (!inBrowser) return;
  const url = new URL(location.href);
  url.searchParams.set('variant', variantId);
  window.history.replaceState({}, '', url.toString());
}

export const variants = {
  ...writable<Variants>({}),
  add(variant: Variation) {
    variants.update(($variants) => ({
      ...$variants,
      [variant.id]: variant,
    }));
  },
  delete(variantId: string) {
    variants.update(($variants) => {
      delete $variants[variantId];
      return $variants;
    });
  },
  setActive(variantId: string) {
    variants.update(($variants) => {
      Object.values($variants).forEach((variant) => {
        variant.active = false;
      });

      $variants[variantId].active = true;

      updateSearchParam(variantId);

      return $variants;
    });
  },
};

export const activeVariant = derived([variants], ([$variants]) => {
  const variations = Object.values($variants);
  return variations.length > 0
    ? variations.find((variant) => variant.active)
    : undefined;
});

export type Variants = {
  [variantId: string]: Variation;
};

export type Variations = Variation[];

export type Variation = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
};
