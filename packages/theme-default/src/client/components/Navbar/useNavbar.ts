import { computed, ComputedRef } from 'vue';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useHasNavbarItems(): ComputedRef<boolean> {
  const theme = useLocalizedThemeConfig();
  return computed(() => (theme.value.navbar?.items?.length ?? 0) > 0);
}
