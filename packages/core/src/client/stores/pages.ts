import allPages from ':virtual/vitebook/pages';

import type { ClientPage } from '../../shared';
import { derived, writable } from './store';
import type { ReadableStore } from './types';

const store = writable(allPages);

if (import.meta.hot) {
  import.meta.hot.accept(
    '/:virtual/vitebook/pages',
    (mod: { default: ClientPage[] }) => {
      store.set(mod.default);
    },
  );
}

export const pages: ReadableStore<ClientPage[]> = {
  subscribe(fn) {
    return derived(store, ($pages) => initURLPattern($pages)).subscribe(fn);
  },
};

/**
 * We init the pattern late to ensure the client entry has a chance to install the `URLPattern`
 * polyfill if needed.
 */
function initURLPattern(pages: ClientPage[]) {
  if (pages[0]?.route.pattern) return pages;

  for (const page of pages) {
    // @ts-expect-error - ignore readonly.
    page.route.pattern = new URLPattern({ pathname: page.route.pathname });
  }

  return pages;
}
