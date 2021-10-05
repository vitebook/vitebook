import { Ref, ref, shallowReadonly } from 'vue';

import Theme from ':virtual/vitebook/theme';

import type { VirtualClientThemeModule } from '../../shared';

export type ThemeRef = Ref<Readonly<typeof Theme>>;

// Singleton.
const themeRef: ThemeRef = ref(shallowReadonly(Theme));

export function useTheme(): Readonly<ThemeRef> {
  return shallowReadonly(themeRef);
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/:virtual/vitebook/theme',
    (mod: VirtualClientThemeModule) => {
      themeRef.value = shallowReadonly(mod.default);
    }
  );
}
