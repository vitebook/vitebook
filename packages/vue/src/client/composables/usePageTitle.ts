import type { SiteLocaleData } from '@vitebook/core/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVuePage } from '../types/page';
import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';
import { usePage } from './usePage';

export type PageTitleRef = ComputedRef<string>;

const page = usePage();
const siteOptions = useLocalizedSiteOptions();

const pageTitleRef = computed(() =>
  resolvePageTitle(siteOptions.value, page.value)
);

export function usePageTitle(): Readonly<PageTitleRef> {
  return shallowReadonly(pageTitleRef);
}

const resolvePageTitle = (
  siteLocale: SiteLocaleData,
  page?: LoadedVuePage
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
