import {
  currentRoute,
  currentRouteLocale,
  joinPath,
  siteOptions,
  withBaseUrl,
} from '@vitebook/client';
import { derived } from 'svelte/store';

import { localizedThemeConfig } from './localizedThemeConfig';

export const languageLinks = derived(
  [siteOptions, localizedThemeConfig, currentRoute, currentRouteLocale],
  ([site, theme, route, routeLocale]) => {
    if (!route || theme.navbar === false) {
      return null;
    }

    const locales = site.locales;
    const localePaths = Object.keys(locales);

    if (localePaths.length < 2) {
      return null;
    }

    const languageMenu = theme.navbar?.languageMenu ?? {};

    const currentPath = route.path.replace(routeLocale, '/');

    const menu = localePaths.map((localePath) => ({
      text:
        languageMenu.selectLanguageName ??
        locales[localePath].langLabel ??
        'Unknown',
      link: joinPath(withBaseUrl(localePath), currentPath),
    }));

    return {
      text: languageMenu.selectLanguageText ?? 'Languages',
      ariaLabel: languageMenu.selectLanguageAriaLabel,
      menu,
    };
  },
);
