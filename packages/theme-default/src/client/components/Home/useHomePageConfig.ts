import { DefaultThemeHomePageLocaleConfig } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useHomePageConfig(): ComputedRef<
  Readonly<DefaultThemeHomePageLocaleConfig> | undefined
> {
  const themeConfig = useLocalizedThemeConfig();

  return computed(() =>
    themeConfig.value.homePage !== false
      ? shallowReadonly(themeConfig.value.homePage ?? {})
      : undefined
  );
}
