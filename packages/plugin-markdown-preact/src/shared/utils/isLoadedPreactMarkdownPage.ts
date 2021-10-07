import type { Page } from '@vitebook/core/shared';

import type { LoadedPreactMarkdownPage } from '../types/PreactMarkdownPage';

export function isLoadedPreactMarkdownPage(
  page?: Page
): page is LoadedPreactMarkdownPage {
  return (
    page?.type === 'preact:md' && !!(page as LoadedPreactMarkdownPage).module
  );
}
