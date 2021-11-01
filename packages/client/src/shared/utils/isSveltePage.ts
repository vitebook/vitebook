import type { Page } from '@vitebook/core';

import type { SveltePage } from '../types/SveltePage';

export function isSveltePage(page?: Page): page is SveltePage {
  return page?.type?.startsWith('svelte') ?? false;
}
