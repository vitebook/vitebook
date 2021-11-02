import { dedupeHead, HeadConfig, SiteLocaleData } from '@vitebook/core';
import { derived } from 'svelte/store';

import type { LoadedClientPage } from '../../shared';
import { currentPage } from './currentPage';
import { currentPageDescription } from './currentPageDescription';
import { currentPageTitle } from './currentPageTitle';
import { localizedSiteOptions } from './localizedSiteOptions';

export const currentPageHead = derived(
  [currentPageTitle, currentPageDescription, localizedSiteOptions, currentPage],
  ([title, description, site, page]) =>
    resolvePageHead(title, description, site, page),
);

const resolvePageHead = (
  title: string,
  description: string,
  siteLocale: SiteLocaleData,
  page?: LoadedClientPage,
): HeadConfig[] => {
  const head: HeadConfig[] = [];
  head.push(...(page?.meta.head ?? []));
  head.push(...siteLocale.head);
  head.push(['title', {}, title]);
  head.push(['meta', { name: 'description', content: description }]);
  return dedupeHead(head);
};
