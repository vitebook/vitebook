import type { Page } from '@vitebook/core/shared';

import type { LoadedVueMarkdownPage, VueMarkdownPage } from './VueMarkdownPage';

export function isVueMarkdownPage(page?: Page): page is VueMarkdownPage {
  return page?.type === 'vue:md';
}

export function isLoadedVueMarkdownPage(
  page?: Page
): page is LoadedVueMarkdownPage {
  return page?.type === 'vue:md' && !!(page as LoadedVueMarkdownPage).module;
}
