import type { Page } from '@vitebook/core/shared';

import type { LoadedMarkdownPage } from '../types/MarkdownPage';

export function isLoadedMarkdownPage(page?: Page): page is LoadedMarkdownPage {
  return (
    (page?.type?.endsWith('md') ?? false) &&
    !!(page as LoadedMarkdownPage).module
  );
}
