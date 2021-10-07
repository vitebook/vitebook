import type { Page } from '@vitebook/core/shared';

import type { PreactPage } from '../types/PreactPage';

export function isPreactComponentPage(page?: Page): page is PreactPage {
  return /preact:(jsx|tsx)/.test(page?.type ?? '');
}
