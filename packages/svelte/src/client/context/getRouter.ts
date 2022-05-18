import { getContext } from 'svelte';

import type { Router } from '../router/router';

export const ROUTER_CTX_KEY = Symbol(
  import.meta.env.DEV ? 'VITEBOOK_ROUTER' : '',
);

export function getRouter() {
  return getContext(ROUTER_CTX_KEY) as Router;
}
