import { computed, ComputedRef, Ref, ref, shallowReadonly } from 'vue';
import { useRouter } from 'vue-router';

import pages from ':virtual/vitebook/pages';

import type { ClientPage, VirtualClientPagesModule } from '../../shared';

export type PagesRef = Ref<Readonly<ClientPage[]>>;

// Singleton.
const pagesRef: PagesRef = ref(shallowReadonly(pages));

export function usePages(): Readonly<PagesRef> {
  return shallowReadonly(pagesRef);
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/:virtual/vitebook/pages',
    (mod: VirtualClientPagesModule) => {
      pagesRef.value = shallowReadonly(mod.default);
    }
  );
}

export function useFirstPage(): ComputedRef<ClientPage | undefined> {
  return computed(() => pagesRef.value[0]);
}

export function useIsPageRoute(): ComputedRef<boolean> {
  const router = useRouter();
  return computed(() =>
    pagesRef.value.some((page) => page.route === router.currentRoute.value.path)
  );
}
