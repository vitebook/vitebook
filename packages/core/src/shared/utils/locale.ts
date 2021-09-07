import type { LocaleConfig } from '../types/LocaleConfig.js';
import { inBrowser } from './support.js';
import { removeEndingSlash } from './url.js';

export const resolveLocalePath = (
  locales: LocaleConfig,
  routePath: string
): string => {
  const localePaths = Object.keys(locales).sort((a, b) => {
    const levelDelta = b.split('/').length - a.split('/').length;
    if (levelDelta !== 0) {
      return levelDelta;
    }
    return b.length - a.length;
  });

  for (const localePath of localePaths) {
    if (routePath.startsWith(localePath)) {
      return localePath;
    }
  }

  return '/';
};

/**
 * Clean up the route by removing the `base` path if it's set in config.
 */
export function cleanRoute(baseUrl: string, route: string): string {
  if (!inBrowser) {
    return route;
  }

  const baseWithoutSuffix = removeEndingSlash(baseUrl);

  return route.slice(baseWithoutSuffix.length);
}
