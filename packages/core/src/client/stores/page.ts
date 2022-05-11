import { Writable, writable } from 'svelte/store';

import type { LoadedPage } from '../../shared';

export type PageStore = {
  subscribe: Writable<LoadedPage>['subscribe'];
  __update: Writable<LoadedPage>['update'];
  __set: Writable<LoadedPage>['set'];
};

const store = writable<LoadedPage>();

export const page: PageStore = {
  subscribe: store.subscribe,
  __update: store.update,
  __set: store.set,
};
