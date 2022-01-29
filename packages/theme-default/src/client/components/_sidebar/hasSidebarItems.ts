import { derived } from 'svelte/store';

import { sidebarItems } from './sidebarItems';

export const hasSidebarItems = derived(
  sidebarItems,
  (items) => items.length > 0,
);
