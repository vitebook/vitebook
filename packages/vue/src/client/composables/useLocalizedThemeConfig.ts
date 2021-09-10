import type { DefaultThemeConfig, ThemeConfig } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';

export type LocalizedThemeConfigRef<
  Theme extends ThemeConfig = DefaultThemeConfig
> = ComputedRef<Readonly<Theme>>;

const siteOptions = useLocalizedSiteOptions();

const localizedThemeConfigRef: LocalizedThemeConfigRef = computed(() =>
  shallowReadonly(siteOptions.value.theme)
);

export function useLocalizedThemeConfig<
  Theme extends ThemeConfig = DefaultThemeConfig
>(): Readonly<LocalizedThemeConfigRef<Theme>> {
  return shallowReadonly(
    localizedThemeConfigRef as LocalizedThemeConfigRef<Theme>
  );
}
