import allLayouts from ':virtual/vitebook/layouts';

import { type ClientLayout } from '../../shared';
import { readable } from './store';

export const layouts = readable(allLayouts, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept(
      '/:virtual/vitebook/layouts',
      (mod: { default: ClientLayout[] }) => {
        set(mod.default);
      },
    );
  }
});
