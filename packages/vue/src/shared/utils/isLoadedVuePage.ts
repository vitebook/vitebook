import type { Page } from '@vitebook/core';

import type { LoadedVuePage } from '../types/VuePage';
import { isVuePage } from './isVuePage';

export function isLoadedVuePage(page?: Page): page is LoadedVuePage {
  return isVuePage(page) && !!(page as LoadedVuePage).module;
}
