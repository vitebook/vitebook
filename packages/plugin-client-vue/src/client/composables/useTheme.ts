import Theme from '@virtual/vitebook/core/theme';
import { readonly, Ref, ref } from 'vue';

import type { VueTheme } from '../../theme';

export type ThemeRef = Ref<VueTheme>;

const themeRef: ThemeRef = ref(Theme);

export function useTheme(): ThemeRef {
  return readonly(themeRef) as ThemeRef;
}

if (import.meta.hot) {
  import.meta.hot.accept('/@virtual/vitebook/core/theme', (m) => {
    themeRef.value = m.default;
  });
}
