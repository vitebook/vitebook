import type { VirtualSiteDataModule } from '@vitebook/core/shared';
import { readable } from 'svelte/store';

import options from ':virtual/vitebook/site';

export const siteOptions = readable(options, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept(
      '/:virtual/vitebook/site',
      (mod: VirtualSiteDataModule) => {
        set(mod.default);
      }
    );
  }
});
