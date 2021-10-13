import type { Page } from '@vitebook/core/shared';

import type { LoadedVueMarkdownPage } from '../types/VueMarkdownPage';

export function isLoadedVueMarkdownPage(
  page?: Page
): page is LoadedVueMarkdownPage {
  return page?.type === 'vue:md' && !!(page as LoadedVueMarkdownPage).module;
}
