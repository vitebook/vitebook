import type { SiteOptions, VirtualSiteDataModule } from '@vitebook/core';
import { readable } from 'svelte/store';

import options from ':virtual/vitebook/site';

export const siteOptions = readable<SiteOptions>(options, (set) => {
  if (import.meta.hot) {
    import.meta.hot.accept('/:virtual/vitebook/site', (mod) => {
      set((mod as unknown as VirtualSiteDataModule).default);
    });
  }
});
