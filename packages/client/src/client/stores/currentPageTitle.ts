import { SiteLocaleData, toTitleCase } from '@vitebook/core';
import { derived } from 'svelte/store';

import type { LoadedClientPage } from '../../shared';
import { currentPage } from './currentPage';
import { localizedSiteOptions } from './localizedSiteOptions';

export const currentPageTitle = derived(
  [localizedSiteOptions, currentPage],
  ([site, page]) => resolvePageTitle(site, page),
);

const resolvePageTitle = (
  siteLocale: SiteLocaleData,
  page?: LoadedClientPage,
): string => {
  const title = page?.meta.title ?? inferPageTitle(page);
  return title ? `${title} | ${siteLocale.title}` : siteLocale.title;
};

export function inferPageTitle(page?: LoadedClientPage): string | null {
  if (!page) return null;
  return toTitleCase(page.rootPath.split('.')[0].split('/').slice(1).join(' '));
}
