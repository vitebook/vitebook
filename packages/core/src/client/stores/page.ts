import type { LoadedClientPage } from '../../shared';
import { writable } from './store';
import type { WritableStore } from './types';

export type PageStore = {
  subscribe: WritableStore<LoadedClientPage>['subscribe'];
  __update: WritableStore<LoadedClientPage>['update'];
  __set: WritableStore<LoadedClientPage>['set'];
};

const store = writable<LoadedClientPage>();

export const createPageStore: () => PageStore = () => ({
  subscribe: store.subscribe,
  __update: store.update,
  __set: store.set,
});
