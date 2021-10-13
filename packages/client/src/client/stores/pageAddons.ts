import { readable } from 'svelte/store';

import addons from ':virtual/vitebook/addons';

import type { VirtualPageAddonsModule } from '../../shared';

export const pageAddons = readable(addons, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept(
      '/:virtual/vitebook/addons',
      (mod: VirtualPageAddonsModule) => {
        set(mod.default);
      }
    );
  }
});
