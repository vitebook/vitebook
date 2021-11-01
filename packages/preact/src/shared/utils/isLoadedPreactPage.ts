import type { Page } from '@vitebook/core';

import type { LoadedPreactPage } from '../types/PreactPage';
import { isPreactPage } from './isPreactPage';

export function isLoadedPreactPage(page?: Page): page is LoadedPreactPage {
  return isPreactPage(page) && !!(page as LoadedPreactPage).module;
}
