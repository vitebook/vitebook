import type { VitebookSSRContext } from '@vitebook/core';
import { getContext } from 'svelte';

export const SSR_CTX_KEY = Symbol(import.meta.env.DEV ? 'VITEBOOK_SSR' : '');

export function getSSRContext() {
  return getContext(SSR_CTX_KEY) as VitebookSSRContext;
}
