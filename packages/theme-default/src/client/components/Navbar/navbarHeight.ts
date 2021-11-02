import { currentRoute } from '@vitebook/client';
import { tick } from 'svelte';
import { readable } from 'svelte/store';

import { isLargeScreen } from '../../stores/isLargeScreen';

export const navbarHeight = readable(0, (set) => {
  const update = () => {
    tick().then(() => {
      set(
        parseFloat(
          window
            .getComputedStyle(document.querySelector('.theme.__vbk__')!)
            .getPropertyValue('--vbk--navbar-height'),
        ) * 16,
      );
    });
  };

  const dispose: (() => void)[] = [];
  dispose.push(currentRoute.subscribe(update));
  dispose.push(isLargeScreen.subscribe(update));
  return () => {
    dispose.forEach((unsub) => unsub());
  };
});
