import { computed, ComputedRef } from 'vue';

import type { DefaultThemeNavbarLocaleConfig } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useNavbarConfig(): ComputedRef<
  DefaultThemeNavbarLocaleConfig | undefined
> {
  const theme = useLocalizedThemeConfig();
  return computed(() =>
    theme.value.navbar !== false ? theme.value.navbar : undefined
  );
}

export function useHasNavbarItems(): ComputedRef<boolean> {
  const config = useNavbarConfig();
  return computed(() => (config.value?.items?.length ?? 0) > 0);
}
