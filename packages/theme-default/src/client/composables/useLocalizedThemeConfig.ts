import { useLocalizedThemeConfig as useUserThemeConfig } from '@vitebook/client';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { DefaultThemeConfig, defaultThemeLocaleOptions } from '../../shared';

export function useLocalizedThemeConfig(): ComputedRef<
  Readonly<DefaultThemeConfig>
> {
  const userConfig = useUserThemeConfig();
  return computed(() =>
    shallowReadonly({
      ...defaultThemeLocaleOptions,
      ...userConfig.value
    })
  );
}
