import {
  activeVariant,
  inBrowser,
  variants,
  Variation,
} from '@vitebook/client';
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { get } from 'svelte/store';

import { useActiveVariant, useVariants } from '../hooks/useVariants';

export type VariantProps = {
  name: string;
  description?: string;
  children: ComponentChildren;
  onEnter?: (variant: Variation) => void;
  onExit?: (variant: Variation) => void;
};

function Variant({
  name,
  description,
  children,
  onEnter,
  onExit,
}: VariantProps) {
  const variantId = useRef(encodeURI(`${name}`.toLowerCase()));
  const hasAddedVariant = useRef(false);
  const _activeVariant = useActiveVariant();
  const visibleState = useRef('exit');

  const searchParams = useRef(
    inBrowser ? new URL(location.href).searchParams : undefined,
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
            (v) => v.id === variantId.current,
          ) === 0
        : searchParams.current?.get('variant')?.toLowerCase() ===
          variantId.current,
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
      visibleState.current = 'exit';
    };
  }, []);

  useEffect(() => {
    if (_activeVariant?.id === variantId.current) {
      if (visibleState.current !== 'enter') {
        onEnter?.(get(variants)[variantId.current]!);
        visibleState.current = 'enter';
      }
    } else {
      if (visibleState.current !== 'exit') {
        onExit?.(get(variants)[variantId.current]!);
        visibleState.current = 'exit';
      }
    }
  }, [_activeVariant]);

  return <>{get(variants)[variantId.current]?.active && children}</>;
}

Variant.displayName = 'Variant';

export default Variant;
