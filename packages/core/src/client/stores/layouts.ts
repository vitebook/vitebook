import allLayouts from ':virtual/vitebook/layouts';

import { readable } from './store';

export const layouts = readable(allLayouts, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept('/:virtual/vitebook/layouts', (mod) => {
      set(mod?.default ?? []);
    });
  }
});
