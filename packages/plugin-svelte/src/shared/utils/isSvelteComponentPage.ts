import type { Page } from '@vitebook/core/shared';

import type { LoadedSveltePage, SveltePage } from '../types/SveltePage';

export function isSvelteComponentPage(page?: Page): page is SveltePage {
  return page?.type === 'svelte';
}

export function isLoadedSveltePage(page?: Page): page is LoadedSveltePage {
  return page?.type === 'svelte' && !!(page as LoadedSveltePage).module;
}
