import type { Page } from '@vitebook/core';

import type { VueMarkdownPage } from '../types/VueMarkdownPage';

export function isVueMarkdownPage(page?: Page): page is VueMarkdownPage {
  return page?.type === 'vue:md';
}
