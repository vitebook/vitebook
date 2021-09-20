import type { SiteLocaleData } from '@vitebook/core/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef } from 'vue';

import type { LoadedPage } from '../types/page';
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
  page?: LoadedPage
): string => {
  let title: string;

  if (isVueMarkdownPage(page)) {
    title = page.data.frontmatter.title ?? page.data.title;
  } else if (isStoryPage(page)) {
    title = page.story?.title ?? '';
  } else {
    title = page?.name ?? '';
  }

  return page && title.length > 0
    ? `${title} | ${siteLocale.title}`
    : siteLocale.title;
};
