import type { SiteLocaleData } from '@vitebook/core/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVuePage } from '../types/page';
import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';
import { usePage } from './usePage';

export type PageDescriptionRef = ComputedRef<string>;

const page = usePage();
const siteOptions = useLocalizedSiteOptions();

const pageDescriptionRef = computed(() =>
  resolvePageDescription(siteOptions.value, page.value)
);

export function usePageDescription(): Readonly<PageDescriptionRef> {
  return shallowReadonly(pageDescriptionRef);
}

const resolvePageDescription = (
  siteLocale: SiteLocaleData,
  page?: LoadedVuePage
): string => {
  let description = '';

  if (isVueMarkdownPage(page)) {
    description = page.data.frontmatter.description ?? '';
  } else if (isStoryPage(page)) {
    description = page.story?.description ?? '';
  }

  return page && description.length > 0 ? description : siteLocale.description;
};
