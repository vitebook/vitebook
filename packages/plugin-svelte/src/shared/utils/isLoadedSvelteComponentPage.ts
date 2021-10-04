import type { Page } from '@vitebook/core/shared';

import type { LoadedSveltePage } from '../types/SveltePage';

export function isLoadedSvelteComponentPage(
  page?: Page
): page is LoadedSveltePage {
  return (
    (page?.type?.startsWith('svelte') ?? false) &&
    !!(page as LoadedSveltePage).module
  );
}
