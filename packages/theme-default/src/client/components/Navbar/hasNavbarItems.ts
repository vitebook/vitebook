import { derived } from 'svelte/store';

import { navbarConfig } from './navbarConfig';

export const hasNavbarItems = derived(
  navbarConfig,
  (config) => (config?.items?.length ?? 0) > 0,
);
