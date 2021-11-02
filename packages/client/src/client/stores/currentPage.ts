import { Readable, writable } from 'svelte/store';

import type { LoadedClientPage } from '../../shared';

const store = writable<LoadedClientPage | undefined>();

export const currentPage: Readable<LoadedClientPage | undefined> & {
  __update: typeof store['update'];
  __set: typeof store['set'];
} = {
  subscribe: store.subscribe,
  __update: store.update,
  __set: store.set,
};
