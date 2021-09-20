import {
  joinPath,
  useRouteLocale,
  useSiteOptions,
  withBaseUrl
} from '@vitebook/client';
import { computed, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import type { NavItemWithMenu } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useLanguageLinks(): ComputedRef<NavItemWithMenu | null> {
  const router = useRouter();
  const site = useSiteOptions();
  const theme = useLocalizedThemeConfig();
  const localePath = useRouteLocale();

  return computed(() => {
    const locales = site.value.locales;
    const localePaths = Object.keys(locales);

    if (localePaths.length < 2) {
      return null;
    }

    const languageMenu = theme.value.navbar?.languageMenu ?? {};

    const currentPath = router.currentRoute.value.path.replace(
      localePath.value,
      '/'
    );

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
