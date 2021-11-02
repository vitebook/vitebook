import type { SiteLocaleData } from '@vitebook/core';
import { derived } from 'svelte/store';

import type { LoadedClientPage } from '../../shared';
import { currentPage } from './currentPage';
import { localizedSiteOptions } from './localizedSiteOptions';

export const currentPageDescription = derived(
  [localizedSiteOptions, currentPage],
  ([site, page]) => resolvePageDescription(site, page),
);

const resolvePageDescription = (
  siteLocale: SiteLocaleData,
  page?: LoadedClientPage,
): string => {
  const description = page?.meta.description;
  return description ? description : siteLocale.description;
};
