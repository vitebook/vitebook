import type { Page } from '@vitebook/core/shared';

import type { MarkdownPage } from '../types/MarkdownPage';

export function isMarkdownPage(page?: Page): page is MarkdownPage {
  return page?.type === 'md';
}
