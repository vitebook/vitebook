import type { Page } from '@vitebook/core';

import type { LoadedVueMarkdownPage } from '../types/VueMarkdownPage';
import { isVueMarkdownPage } from './isVueMarkdownPage';

export function isLoadedVueMarkdownPage(
  page?: Page
): page is LoadedVueMarkdownPage {
  return isVueMarkdownPage(page) && !!(page as LoadedVueMarkdownPage).module;
}
