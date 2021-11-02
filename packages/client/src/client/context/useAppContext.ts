import type { VitebookSSRContext } from '@vitebook/core';
import { getContext } from 'svelte';

import type { Router } from '../router/router';
import type {
  COMPONENT_SSR_CTX_KEY,
  ROUTER_CTX_KEY,
  SSR_CTX_KEY,
} from './context-keys';

export type ComponentSSRContext = {
  head?: string;
  html?: string;
  css?: { code?: string };
  render?: () => Promise<[marker: string, html: string]>;
};

export type AppContextMap = {
  [SSR_CTX_KEY]: VitebookSSRContext;
  [ROUTER_CTX_KEY]: Router;
  [COMPONENT_SSR_CTX_KEY]: {
    [id: string | symbol]: ComponentSSRContext;
  };
};

export type AppContextKey =
  | typeof COMPONENT_SSR_CTX_KEY
  | typeof ROUTER_CTX_KEY
  | typeof SSR_CTX_KEY;

export function useAppContext<T extends AppContextKey>(
  key: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Map<any, any>,
): AppContextMap[T] {
  return context?.get(key) ?? getContext(key);
}
