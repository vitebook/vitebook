import { dedupeHead, HeadConfig, SiteLocaleData } from '@vitebook/core/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVuePage } from '../types/page';
import { useLocalizedSiteOptions } from './useLocalizedSiteOptions';
import { usePage } from './usePage';
import { usePageDescription } from './usePageDescription';
import { usePageTitle } from './usePageTitle';

export type PageHeadRef = ComputedRef<HeadConfig[]>;

const title = usePageTitle();
const description = usePageDescription();
const siteOptions = useLocalizedSiteOptions();
const page = usePage();

const pageHeadRef: PageHeadRef = computed(() =>
  resolvePageHead(title.value, description.value, siteOptions.value, page.value)
);

export function usePageHead(): Readonly<PageHeadRef> {
  return shallowReadonly(pageHeadRef);
}

const resolvePageHead = (
  title: string,
  description: string,
  siteLocale: SiteLocaleData,
  page?: LoadedVuePage
): HeadConfig[] => {
  const head: HeadConfig[] = [];

  if (isVueMarkdownPage(page)) {
    head.push(...(page.data.frontmatter.head ?? []));
  } else if (isStoryPage(page)) {
    head.push(...(page.story?.head ?? []));
  }

  head.push(...siteLocale.head);
  head.push(['title', {}, title]);
  head.push(['meta', { name: 'description', content: description }]);

  return dedupeHead(head);
};
