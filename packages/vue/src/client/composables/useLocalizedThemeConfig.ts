import type { ThemeConfig } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';

export type LocalizedThemeConfigRef<Theme extends ThemeConfig = ThemeConfig> =
  ComputedRef<Readonly<Theme>>;

const siteOptions = useLocalizedSiteOptions();

const localizedThemeConfigRef: LocalizedThemeConfigRef = computed(() =>
  shallowReadonly(siteOptions.value.theme)
);

export function useLocalizedThemeConfig<
  Theme extends ThemeConfig = ThemeConfig
>(): Readonly<LocalizedThemeConfigRef<Theme>> {
  return shallowReadonly(
    localizedThemeConfigRef as LocalizedThemeConfigRef<Theme>
  );
}
