import pages from '@virtual/vitebook/core/pages';
import type { VirtualPagesModule } from '@vitebook/core/shared';
import { Ref, ref, shallowReadonly } from 'vue';

import type { VuePage } from '../types/page';

export type PagesRef = Ref<Readonly<VuePage[]>>;

const pagesRef: PagesRef = ref(shallowReadonly(pages));

export function usePages(): Readonly<PagesRef> {
  return shallowReadonly(pagesRef);
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/@virtual/vitebook/core/pages',
    (mod: VirtualPagesModule) => {
      pagesRef.value = shallowReadonly(mod.default);
    }
  );
}
