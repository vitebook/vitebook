import { computed, ComputedRef } from 'vue';

import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';

export type SiteLangRef = ComputedRef<string>;

export function useSiteLang(): SiteLangRef {
  const site = useLocalizedSiteOptions();
  return computed(() => site.value.lang);
}
