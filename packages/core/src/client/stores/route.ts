import { type LoadedRoute } from '../router/types';
import { writable } from './store';
import { type WritableStore } from './types';

const store = writable<LoadedRoute>();

export type RouteStore = {
  subscribe: WritableStore<LoadedRoute>['subscribe'];
  __update: WritableStore<LoadedRoute>['update'];
  __set: WritableStore<LoadedRoute>['set'];
};

export const createRouteStore: () => RouteStore = () => ({
  ...store,
  set: undefined,
  update: undefined,
  __update: store.update,
  __set: store.set,
});
