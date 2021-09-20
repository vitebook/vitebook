import type { SiteOptions, ThemeConfig } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useRouteLocale } from './useRouteLocale';
import { useSiteOptions } from './useSiteOptions';

export type LocalizedSiteOptionsRef<Theme extends ThemeConfig> = ComputedRef<
  Readonly<SiteOptions<Theme>>
>;

export function useLocalizedSiteOptions<
  Theme extends ThemeConfig = ThemeConfig
>(): LocalizedSiteOptionsRef<Theme> {
  const site = useSiteOptions();
  const routeLocale = useRouteLocale();

  return computed(() =>
    shallowReadonly({
      ...site.value,
      ...site.value.locales?.[routeLocale.value],
      theme: {
        ...site.value.theme,
        ...site.value.theme.locales?.[routeLocale.value]
      }
    })
  ) as Readonly<LocalizedSiteOptionsRef<Theme>>;
}
