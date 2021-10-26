import { activeVariant, variants } from '@vitebook/client';
import { useEffect, useState } from 'preact/hooks';
import { get } from 'svelte/store';

export function useVariants() {
  const [_variants, _setVariants] = useState(get(variants));

  useEffect(() => {
    return variants.subscribe(($v) => {
      _setVariants({ ...$v });
    });
  }, []);

  return _variants;
}

export function useActiveVariant() {
  const [_activeVariant, _setActiveVariant] = useState(get(activeVariant));

  useEffect(() => {
    return activeVariant.subscribe(($v) => {
      _setActiveVariant($v ? { ...$v } : undefined);
    });
  }, []);

  return _activeVariant;
}
