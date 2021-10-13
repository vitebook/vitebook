import { getContext } from 'svelte';

import type { Router } from '../router/router';
import { ROUTER_CTX_KEY } from './context-keys';

export function useRouter() {
  return getContext(ROUTER_CTX_KEY) as Router;
}
