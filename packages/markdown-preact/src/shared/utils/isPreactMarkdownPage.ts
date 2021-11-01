import type { Page } from '@vitebook/core';

import type { PreactMarkdownPage } from '../types/PreactMarkdownPage';

export function isPreactMarkdownPage(page?: Page): page is PreactMarkdownPage {
  return page?.type === 'preact:md';
}
