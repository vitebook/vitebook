import type { Page } from '@vitebook/core';

import type { MarkdownPage } from '../types/MarkdownPage';

export function isMarkdownPage(page?: Page): page is MarkdownPage {
  return page?.type?.endsWith('md') ?? false;
}
