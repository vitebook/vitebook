import type { SiteLocaleData } from '@vitebook/core/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef } from 'vue';

import type { LoadedPage } from '../types/page';
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
  page?: LoadedPage
): string => {
  let description = '';

  if (isVueMarkdownPage(page)) {
    description = page.data.frontmatter.description ?? '';
  } else if (isStoryPage(page)) {
    description = page.story?.description ?? '';
  }

  return page && description.length > 0 ? description : siteLocale.description;
};
