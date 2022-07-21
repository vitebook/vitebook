import { readable } from 'svelte/store';

import allPages from ':virtual/vitebook/pages';

import type { VirtualClientPagesModule } from '../../shared';

export const pages = readable(allPages, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept('/:virtual/vitebook/pages', (mod) => {
      set((mod as VirtualClientPagesModule).default);
    });
  }
});
