import type { DefaultThemeConfig, ThemeConfig } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useSiteOptions } from './useSiteOptions';

export type ThemeConfigRef<Theme extends ThemeConfig = DefaultThemeConfig> =
  ComputedRef<Readonly<Theme>>;

const siteOptions = useSiteOptions();

const themeConfigRef: ThemeConfigRef = computed(() =>
  shallowReadonly(siteOptions.value.theme)
);

export function useThemeConfig<
  Theme extends ThemeConfig = DefaultThemeConfig
>(): Readonly<ThemeConfigRef<Theme>> {
  return shallowReadonly(themeConfigRef as ThemeConfigRef<Theme>);
}
