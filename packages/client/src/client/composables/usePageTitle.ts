import { SiteLocaleData, toTitleCase } from '@vitebook/core/shared';
import { computed, ComputedRef } from 'vue';

import type { LoadedClientPage } from '../../shared';
import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';
import { usePage } from './usePage';

export type PageTitleRef = ComputedRef<string>;

export function usePageTitle(): PageTitleRef {
  const page = usePage();
  const site = useLocalizedSiteOptions();
  return computed(() => resolvePageTitle(site.value, page.value));
}

const resolvePageTitle = (
  siteLocale: SiteLocaleData,
  page?: LoadedClientPage
): string => {
  const title = page?.meta.title ?? inferPageTitle(page);
  return title ? `${title} | ${siteLocale.title}` : siteLocale.title;
};

const PAGE_TITLE_RE = /\/(.+)\.html$/;

export function inferPageTitle(page?: LoadedClientPage): string | null {
  if (!page) return null;
  return toTitleCase(decodeURI(page.route).match(PAGE_TITLE_RE)?.[1] ?? '');
}
