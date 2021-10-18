import {
  currentRoute,
  ensureLeadingSlash,
  isArray,
  removeEndingSlash,
  withBaseUrl
} from '@vitebook/client';
import { derived } from 'svelte/store';

import type {
  MultiSidebarItemsConfig,
  SidebarItemsConfig
} from '../../../shared';
import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

export function isSidebarItemsConfig(
  config: SidebarItemsConfig | MultiSidebarItemsConfig
): config is SidebarItemsConfig {
  return config === false || config === 'auto' || isArray(config);
}

export const sidebarItemsConfig = derived(
  [localizedThemeConfig, currentRoute],
  ([theme, currentRoute]) => {
    if (!currentRoute) {
      return [];
    }

    const config = theme.sidebar?.items ?? 'auto';

    if (isSidebarItemsConfig(config)) {
      return config;
    }

    const route = removeEndingSlash(
      ensureLeadingSlash(currentRoute.route.path)
    );

    for (const path in config) {
      if (
        route.startsWith(
          withBaseUrl(removeEndingSlash(ensureLeadingSlash(path)))
        )
      ) {
        return config[path];
      }
    }

    return 'auto';
  }
);
