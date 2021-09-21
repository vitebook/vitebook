import { dedupeHead, HeadConfig, SiteLocaleData } from '@vitebook/core/shared';
import { computed, ComputedRef } from 'vue';

import type { LoadedPage } from '../../shared/types/Page';
import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';
import { usePage } from './usePage';
import { usePageDescription } from './usePageDescription';
import { usePageTitle } from './usePageTitle';

export type PageHeadRef = ComputedRef<HeadConfig[]>;

export function usePageHead(): PageHeadRef {
  const title = usePageTitle();
  const description = usePageDescription();
  const site = useLocalizedSiteOptions();
  const page = usePage();
  return computed(() =>
    resolvePageHead(title.value, description.value, site.value, page.value)
  );
}

const resolvePageHead = (
  title: string,
  description: string,
  siteLocale: SiteLocaleData,
  page?: LoadedPage
): HeadConfig[] => {
  const head: HeadConfig[] = [];
  head.push(...(page?.meta.head ?? []));
  head.push(...siteLocale.head);
  head.push(['title', {}, title]);
  head.push(['meta', { name: 'description', content: description }]);
  return dedupeHead(head);
};
