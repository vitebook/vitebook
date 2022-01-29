import {
  currentRoute,
  ensureLeadingSlash,
  isArray,
  removeEndingSlash,
  withBaseUrl,
} from '@vitebook/client';
import { derived } from 'svelte/store';

import type {
  MultiSidebarItemsConfig,
  SidebarItemsConfig,
} from '../../../shared';
import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

export function isSidebarItemsConfig(
  config: SidebarItemsConfig | MultiSidebarItemsConfig,
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
      ensureLeadingSlash(currentRoute.route.path),
    );

    const configPaths = Object.keys(config).sort((a, b) => {
      const levelDelta = b.split('/').length - a.split('/').length;

      if (levelDelta !== 0) {
        return levelDelta;
      }

      return b.length - a.length;
    });

    for (const path of configPaths) {
      if (
        route.startsWith(
          withBaseUrl(removeEndingSlash(ensureLeadingSlash(path))),
        )
      ) {
        return config[path];
      }
    }

    return 'auto';
  },
);
