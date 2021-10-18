import { derived } from 'svelte/store';

import { autoSidebarItems } from './autoSidebarItems';
import { sidebarItemsConfig } from './sidebarItemsConfig';

export const sidebarItems = derived(
  [sidebarItemsConfig, autoSidebarItems],
  ([config, autoItems]) => {
    if (config === false) {
      return [];
    }

    if (config === 'auto') {
      return autoItems;
    }

    return config;
  }
);
