import { getContext } from 'svelte';

import type { VitebookSSRContext } from '../../shared';

export const SSR_CTX_KEY = Symbol(import.meta.env.DEV ? 'VITEBOOK_SSR' : '');

export function getSSRContext() {
  return getContext(SSR_CTX_KEY) as VitebookSSRContext;
}
