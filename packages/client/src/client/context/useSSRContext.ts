import type { VitebookSSRContext } from '@vitebook/core/shared';
import { getContext } from 'svelte';

import { SSR_CTX_KEY } from './context-keys';

export function useSSRContext() {
  return getContext(SSR_CTX_KEY) as VitebookSSRContext;
}
