import type { Page } from '@vitebook/core/shared';

import type { PreactPage } from '../types/PreactPage';

export function isPreactPage(page?: Page): page is PreactPage {
  return /^preact/.test(page?.type ?? '');
}
