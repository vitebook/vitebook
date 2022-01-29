import { isArray } from '@vitebook/core';
import { derived } from 'svelte/store';

import type { SidebarItem, SidebarItemsConfig } from '../../../shared';
import { autoSidebarItems } from './autoSidebarItems';
import { sidebarItemsConfig } from './sidebarItemsConfig';

function unwrapSidebarItemsConfig(
  config: SidebarItemsConfig,
  autoItems: SidebarItem[],
): SidebarItem[] {
  if (config === false) {
    return [];
  }

  if (config === 'auto') {
    return autoItems;
  }

  return config;
}

export const sidebarItems = derived(
  [sidebarItemsConfig, autoSidebarItems],
  ([config, autoItems]) => {
    return config == false || config === 'auto' || isArray(config)
      ? unwrapSidebarItemsConfig(config, autoItems)
      : unwrapSidebarItemsConfig(config.items, autoItems);
  },
);
