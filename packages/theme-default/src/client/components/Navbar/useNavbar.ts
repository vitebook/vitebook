import { computed, ComputedRef } from 'vue';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useHasNavbarItems(): ComputedRef<boolean> {
  const themeConfig = useLocalizedThemeConfig();
  return computed(() => (themeConfig.value.navbar.items?.length ?? 0) > 0);
}
