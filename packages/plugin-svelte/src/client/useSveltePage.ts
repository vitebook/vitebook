import { usePage } from '@vitebook/client';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { isLoadedSvelteComponentPage, LoadedSveltePage } from '../shared';

export type SveltePageRef = ComputedRef<Readonly<LoadedSveltePage> | undefined>;

export function useSveltePage(): SveltePageRef {
  const page = usePage();
  return computed(() =>
    isLoadedSvelteComponentPage(page.value)
      ? shallowReadonly(page.value)
      : undefined
  );
}
