import { writable } from 'svelte/store';

import type { LoadedClientPage } from '../../shared';

const store = writable<LoadedClientPage | undefined>();

export const currentPage = {
  ...store,
  set: undefined,
  update: undefined,
  __update: store.update,
  __set: store.set
};
