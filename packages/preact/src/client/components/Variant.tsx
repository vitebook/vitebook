import { activeVariant, inBrowser, variants } from '@vitebook/client';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { get } from 'svelte/store';

import { useVariants } from '../hooks/useVariants';

export type VariantProps = {
  name: string;
  description?: string;
  children: ComponentChildren;
};

function Variant({ name, description, children }: VariantProps) {
  const variantId = useRef(encodeURI(`${name}`.toLowerCase()));
  const hasAddedVariant = useRef(false);

  const searchParams = useRef(
    inBrowser ? new URL(location.href).searchParams : undefined
  );

  // Only used to trigger re-renders - updates too slow for our needs.
  const _ = useVariants();

  if (!hasAddedVariant.current) {
    const variant = {
      id: variantId.current,
      name: `${name}`,
      description: description,
      active: import.meta.env.SSR
        ? Object.values(get(variants)).length === 0 ||
          Object.values(get(variants)).findIndex(
            (v) => v.id === variantId.current
          ) === 0
        : searchParams.current?.get('variant')?.toLowerCase() ===
          variantId.current
    };

    variants.add(variant);

    hasAddedVariant.current = true;
  }

  useEffect(() => {
    // Hooks are updated too slow, need to get fresh values from store.
    const active = get(activeVariant);
    const variations = Object.values(get(variants));

    if (!active) {
      variants.setActive(variations[0].id);
    } else if (active) {
      // Simply updating query string and other information.
      variants.setActive(active.id);
    }

    return () => {
      variants.delete(variantId.current);
    };
  }, []);

  return <>{get(variants)[variantId.current]?.active && children}</>;
}

Variant.displayName = 'Variant';

export default Variant;
