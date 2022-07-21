import { readable } from 'svelte/store';

import clientTheme from ':virtual/vitebook/theme';

import type { VirtualClientThemeModule } from '../../shared';

export const theme = readable(clientTheme, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept('/:virtual/vitebook/theme', (mod) => {
      set((mod as VirtualClientThemeModule).default);
    });
  }
});
