import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { DefaultThemeHomePageLocaleConfig } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useHomePageConfig(): ComputedRef<
  Readonly<DefaultThemeHomePageLocaleConfig> | undefined
> {
  const theme = useLocalizedThemeConfig();

  return computed(() =>
    theme.value.homePage !== false
      ? shallowReadonly(theme.value.homePage ?? {})
      : undefined
  );
}
