import { isArray } from '@vitebook/core';
import { derived } from 'svelte/store';

import type { MultiSidebarStyleConfig } from '../../../shared';
import { sidebarItemsConfig } from './sidebarItemsConfig';

export const multiSidebarStyleConfig = derived(sidebarItemsConfig, (config) => {
  if (config === false || config === 'auto' || isArray(config)) {
    return {} as MultiSidebarStyleConfig;
  }

  return config as MultiSidebarStyleConfig;
});
