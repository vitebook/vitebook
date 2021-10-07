import { usePage } from '@vitebook/client';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { isLoadedPreactComponentPage, LoadedPreactPage } from '../shared';

export type PreactPageRef = ComputedRef<Readonly<LoadedPreactPage> | undefined>;

export function usePreactPage(): PreactPageRef {
  const page = usePage();
  return computed(() =>
    isLoadedPreactComponentPage(page.value)
      ? shallowReadonly(page.value)
      : undefined
  );
}
