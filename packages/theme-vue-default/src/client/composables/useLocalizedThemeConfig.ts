import {
  defaultThemeLocaleOptions,
  useLocalizedThemeConfig as useUserThemeConfig
} from '@vitebook/vue/client';
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
