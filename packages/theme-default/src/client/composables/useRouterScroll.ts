import { ref } from 'vue';

export interface RouterScroll {
  wait(): Promise<void> | null;
  pending: () => void;
  resolve: () => void;
}

let promise: Promise<void> | null = null;
let promiseResolve: (() => void) | null = null;

const scrollPromise: RouterScroll = {
  wait: () => promise,
  pending: () => {
    promise = new Promise((resolve) => (promiseResolve = resolve));
  },
  resolve: () => {
    promiseResolve?.();
    promise = null;
    promiseResolve = null;
  }
};

export const routerScrollBehaviour = ref<'auto' | 'smooth'>('auto');

export const useRouterScroll = (): RouterScroll => scrollPromise;
