import type { NavItemWithMenu } from '@vitebook/core/shared';
import {
  joinPath,
  useRouteLocale,
  useSiteOptions,
  withBaseUrl
} from '@vitebook/vue/client';
import { computed, ComputedRef } from 'vue';
import { useRoute } from 'vue-router';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useLanguageLinks(): ComputedRef<NavItemWithMenu | null> {
  const siteConfig = useSiteOptions();
  const themeConfig = useLocalizedThemeConfig();
  const localePath = useRouteLocale();

  return computed(() => {
    const locales = siteConfig.value.locales;
    const localePaths = Object.keys(locales);

    if (localePaths.length < 2) {
      return null;
    }

    const languageMenu = themeConfig.value.navbar.languageMenu ?? {};

    const route = useRoute();
    const currentPath = route.path.replace(localePath.value, '/');

    const menu = localePaths.map((localePath) => ({
      text:
        languageMenu.selectLanguageName ??
        locales[localePath].langLabel ??
        'Unknown',
      link: joinPath(withBaseUrl(localePath), currentPath)
    }));

    return {
      text: languageMenu.selectLanguageText ?? 'Languages',
      ariaLabel: languageMenu.selectLanguageAriaLabel,
      menu
    };
  });
}
