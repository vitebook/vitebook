import { currentRoute } from '@vitebook/client';
import { tick } from 'svelte';
import { readable } from 'svelte/store';

import { useMediaQuery } from '../../stores/useMediaQuery';

export const navbarHeight = readable(0, (set) => {
  const update = () => {
    tick().then(() => {
      set(
        parseFloat(
          window
            .getComputedStyle(document.body)
            .getPropertyValue('--vbk--navbar-height')
        ) * 16
      );
    });
  };

  const dispose: (() => void)[] = [];
  dispose.push(currentRoute.subscribe(update));
  dispose.push(useMediaQuery('(min-width: 992px)').subscribe(update));
  return () => {
    dispose.forEach((unsub) => unsub());
  };
});
