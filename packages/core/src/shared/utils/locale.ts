import type { LocaleConfig } from '../types/LocaleConfig';
import { inBrowser } from './support';
import { removeEndingSlash } from './url';

export const resolveLocalePath = (
  baseUrl: string,
  locales: LocaleConfig,
  routePath: string,
): string => {
  const localePaths = Object.keys(locales).sort((a, b) => {
    const levelDelta = b.split('/').length - a.split('/').length;
    if (levelDelta !== 0) {
      return levelDelta;
    }
    return b.length - a.length;
  });

  const strippedRoutePath = stripBaseUrlFromRoute(baseUrl, routePath);

  for (const localePath of localePaths) {
    if (strippedRoutePath.startsWith(localePath)) {
      return localePath;
    }
  }

  return '/';
};

export function stripBaseUrlFromRoute(
  baseUrl: string,
  routePath: string,
): string {
  if (!inBrowser) {
    return routePath;
  }

  const baseWithoutSuffix = removeEndingSlash(baseUrl);

  return routePath.slice(baseWithoutSuffix.length);
}
