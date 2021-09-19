import { useLocalizedThemeConfig as useUserThemeConfig } from '@vitebook/client';
import { defaultThemeLocaleOptions } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

export function useLocalizedThemeConfig(): ComputedRef<
  Readonly<typeof defaultThemeLocaleOptions>
> {
  const userConfig = useUserThemeConfig();
  return computed(() =>
    shallowReadonly({
      ...defaultThemeLocaleOptions,
      ...userConfig.value
    })
  );
}
