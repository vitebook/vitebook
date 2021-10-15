import { inBrowser } from '@vitebook/client';
import { readable } from 'svelte/store';

export function useMediaQuery(query: string) {
  if (!inBrowser) return readable(false);

  const mediaQuery = window.matchMedia(query);

  return readable(mediaQuery.matches, (set) => {
    const handler = (event: MediaQueryListEvent) => {
      set(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  });
}
