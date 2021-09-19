import { computed, ComputedRef, shallowReadonly } from 'vue';

import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';

export type SiteLangRef = ComputedRef<string>;

const siteOptions = useLocalizedSiteOptions();

const siteLangRef = computed(() => siteOptions.value.lang);

export function useSiteLang(): Readonly<SiteLangRef> {
  return shallowReadonly(siteLangRef);
}
