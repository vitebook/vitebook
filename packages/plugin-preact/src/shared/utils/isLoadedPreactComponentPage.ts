import type { Page } from '@vitebook/core/shared';

import type { LoadedPreactPage } from '../types/PreactPage';

export function isLoadedPreactComponentPage(
  page?: Page
): page is LoadedPreactPage {
  return (
    /preact:(jsx|tsx)/.test(page?.type ?? '') &&
    !!(page as LoadedPreactPage).module
  );
}
