import type { Page } from '@vitebook/core/shared';

import type { VueMarkdownPage } from './VueMarkdownPage';

export function isVueMarkdownPage(page?: Page): page is VueMarkdownPage {
  return page?.type === 'vue:md';
}
