import pages from '@virtual/vitebook/core/pages';
import type { Page } from '@vitebook/core';
import { readonly, Ref, ref } from 'vue';

export type PagesRef = Ref<Page[]>;

const pagesRef = ref(readonly(pages)) as PagesRef;

export function usePages(): PagesRef {
  return pagesRef;
}

if (import.meta.hot) {
  import.meta.hot.accept('/@virtual/vitebook/core/pages', (m) => {
    pagesRef.value = readonly(m.default);
  });
}
