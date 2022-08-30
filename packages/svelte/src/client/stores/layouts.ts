import { type Readable, writable } from 'svelte/store';
import { type ClientLayout } from 'vitebook';

import allLayouts from ':virtual/vitebook/layouts';

const __layouts = writable(allLayouts);

export const layouts: Readable<ClientLayout[]> = {
  subscribe: __layouts.subscribe,
};

if (import.meta.hot) {
  import.meta.hot.accept('/:virtual/vitebook/layouts', (mod) => {
    __layouts.set(mod?.default ?? []);
  });
}
