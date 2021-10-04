import type { SiteLocaleData } from '@vitebook/core/shared';
import { computed, ComputedRef } from 'vue';

import type { LoadedClientPage } from '../../shared';
import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';
import { usePage } from './usePage';

export type PageDescriptionRef = ComputedRef<string>;

export function usePageDescription(): PageDescriptionRef {
  const page = usePage();
  const site = useLocalizedSiteOptions();
  return computed(() => resolvePageDescription(site.value, page.value));
}

const resolvePageDescription = (
  siteLocale: SiteLocaleData,
  page?: LoadedClientPage
): string => {
  const description = page?.meta.description;
  return description ? description : siteLocale.description;
};
