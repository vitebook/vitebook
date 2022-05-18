import { readable } from 'svelte/store';

import allPages from ':virtual/vitebook/pages';

import type { ClientPage } from '../../shared';

export const pages = readable(allPages, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept(
      '/:virtual/vitebook/pages',
      (mod: { default: ClientPage[] }) => {
        set(mod.default);
      },
    );
  }
});
