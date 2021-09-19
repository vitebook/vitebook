import pages from '@virtual/vitebook/core/pages';
import { VirtualPagesModule } from '@vitebook/core/shared';
import { computed, ComputedRef, Ref, ref, shallowReadonly } from 'vue';
import { useRouter } from 'vue-router';

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

export function useFirstPage(): ComputedRef<VuePage | undefined> {
  return computed(() => pagesRef.value[0]);
}

export function useIsPageRoute(): ComputedRef<boolean> {
  const router = useRouter();
  return computed(() =>
    pagesRef.value.some((page) => page.route === router.currentRoute.value.path)
  );
}
