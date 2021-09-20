import type { ThemeConfig } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';

export type LocalizedThemeConfigRef<Theme extends ThemeConfig = ThemeConfig> =
  ComputedRef<Readonly<Theme>>;

export function useLocalizedThemeConfig<
  Theme extends ThemeConfig = ThemeConfig
>(): LocalizedThemeConfigRef<Theme> {
  const site = useLocalizedSiteOptions();
  return computed(() =>
    shallowReadonly(site.value.theme)
  ) as LocalizedThemeConfigRef<Theme>;
}
