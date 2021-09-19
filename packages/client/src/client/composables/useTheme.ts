import Theme from '@virtual/vitebook/core/theme';
import { Ref, ref, shallowReadonly } from 'vue';

import type { VirtualVueThemeModule, VueTheme } from '../types/theme';

export type ThemeRef = Ref<Readonly<VueTheme>>;

const themeRef: ThemeRef = ref(shallowReadonly(Theme));

export function useTheme(): Readonly<ThemeRef> {
  return shallowReadonly(themeRef);
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/@virtual/vitebook/core/theme',
    (mod: VirtualVueThemeModule) => {
      themeRef.value = shallowReadonly(mod.default);
    }
  );
}
