import type { Page } from '@vitebook/core';

import type { VuePage } from '../types/VuePage';

export function isVuePage(page?: Page): page is VuePage {
  return /^vue/.test(page?.type ?? '');
}
