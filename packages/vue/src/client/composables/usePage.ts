import { Ref, ref, shallowReadonly } from 'vue';

import type { LoadedVuePage } from '../types/page';

export type PageRef = Ref<Readonly<LoadedVuePage> | undefined>;

const pageRef: PageRef = ref(undefined);

export function usePage(): Readonly<PageRef> {
  return shallowReadonly(pageRef);
}

export function setPageRef(page?: LoadedVuePage): void {
  pageRef.value = page ? shallowReadonly(page) : undefined;
}
