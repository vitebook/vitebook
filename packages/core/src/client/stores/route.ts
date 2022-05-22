import { type LoadedRoute } from '../router/types';
import { writable } from './store';

const store = writable<LoadedRoute>();

export const route = {
  ...store,
  set: undefined,
  update: undefined,
  __update: store.update,
  __set: store.set,
};
