import type { Page } from '@vitebook/core/shared';

import type { MarkdownPage } from './page';

export function isMarkdownPage(page?: Page<unknown>): page is MarkdownPage {
  return page?.type === 'md';
}
