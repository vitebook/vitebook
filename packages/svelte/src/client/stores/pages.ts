import { derived, writable } from 'svelte/store';
import { type ClientPage } from 'vitebook';

import allPages from ':virtual/vitebook/pages';

const __pages = writable(allPages);

if (import.meta.hot) {
  import.meta.hot.accept('/:virtual/vitebook/pages', (mod) => {
    __pages.set(mod?.default ?? []);
  });
}

export const pages = derived(__pages, (pages) => initURLPattern(pages));

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
