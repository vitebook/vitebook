import type {
  DefaultThemeConfig,
  SiteOptions,
  ThemeConfig
} from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useRouteLocale } from './useRouteLocale';
import { useSiteOptions } from './useSiteOptions';

export type LocalizedSiteOptionsRef<
  Theme extends ThemeConfig = DefaultThemeConfig
> = ComputedRef<Readonly<SiteOptions<Theme>>>;

const siteOptions = useSiteOptions();
const routeLocale = useRouteLocale();

const localizedSiteOptionsRef = computed(() =>
  shallowReadonly({
    ...siteOptions.value,
    ...siteOptions.value.locales?.[routeLocale.value],
    theme: {
      ...siteOptions.value.theme,
      ...siteOptions.value.theme.locales?.[routeLocale.value]
    }
  })
);

export function useLocalizedSiteOptions<
  Theme extends ThemeConfig = DefaultThemeConfig
>(): Readonly<LocalizedSiteOptionsRef<Theme>> {
  return shallowReadonly(localizedSiteOptionsRef) as Readonly<
    LocalizedSiteOptionsRef<Theme>
  >;
}
