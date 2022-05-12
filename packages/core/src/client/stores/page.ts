import { Writable, writable } from 'svelte/store';

import type { LoadedClientPage } from '../../shared';

export type PageStore = {
  subscribe: Writable<LoadedClientPage>['subscribe'];
  __update: Writable<LoadedClientPage>['update'];
  __set: Writable<LoadedClientPage>['set'];
};

const store = writable<LoadedClientPage>();

export const page: PageStore = {
  subscribe: store.subscribe,
  __update: store.update,
  __set: store.set,
};
