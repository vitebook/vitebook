import type { Page } from '@vitebook/core';

import type { LoadedPreactMarkdownPage } from '../types/PreactMarkdownPage';
import { isPreactMarkdownPage } from './isPreactMarkdownPage';

export function isLoadedPreactMarkdownPage(
  page?: Page,
): page is LoadedPreactMarkdownPage {
  return (
    isPreactMarkdownPage(page) && !!(page as LoadedPreactMarkdownPage).module
  );
}
