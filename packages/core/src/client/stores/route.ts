import { writable } from 'svelte/store';

import type { LoadedRouteLocation } from '../router/types';

const store = writable<LoadedRouteLocation>();

export const route = {
  ...store,
  set: undefined,
  update: undefined,
  __update: store.update,
  __set: store.set,
};
