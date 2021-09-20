import { usePreferredDark, useStorage } from '@vueuse/core';
import {
  computed,
  inject,
  InjectionKey,
  onBeforeMount,
  onUnmounted,
  provide,
  watch,
  WritableComputedRef
} from 'vue';

import { defaultThemeLocaleOptions } from '../../shared';
import { useLocalizedThemeConfig } from './useLocalizedThemeConfig';

export type DarkModeRef = WritableComputedRef<boolean>;

export const darkModeSymbol: InjectionKey<DarkModeRef> = Symbol(
  import.meta.env.DEV ? 'darkMode' : ''
);

export function useDarkMode(): DarkModeRef {
  const isDarkMode = inject(darkModeSymbol);
  if (!isDarkMode) {
    throw new Error('useDarkMode() is called without provider.');
  }
  return isDarkMode;
}

export function initDarkMode(): void {
  const theme = useLocalizedThemeConfig();
  const isDarkPreferred = usePreferredDark();
  const darkStorage = useStorage('vitebook-color-scheme', 'auto');

  const isDarkMode = computed<boolean>({
    get() {
      const isEnabled =
        theme.value.darkMode?.enabled ??
        defaultThemeLocaleOptions.darkMode.enabled;

      // Disable dark mode
      if (!isEnabled) {
        return false;
      }

      // Auto detected from prefers-color-scheme
      if (darkStorage.value === 'auto') {
        return isDarkPreferred.value;
      }

      // Storage value
      return darkStorage.value === 'dark';
    },
    set(isDark) {
      if (isDark === isDarkPreferred.value) {
        darkStorage.value = 'auto';
      } else {
        darkStorage.value = isDark ? 'dark' : 'light';
      }
    }
  });

  provide(darkModeSymbol, isDarkMode);
  updateHtmlDarkClass(isDarkMode);
}

function updateHtmlDarkClass(isDarkMode: DarkModeRef): void {
  const update = (value = isDarkMode.value): void => {
    // Set `class="dark"` on `<html>` element.
    const htmlEl = window?.document.querySelector('html');
    htmlEl?.classList.toggle('dark', value);
  };

  onBeforeMount(() => {
    watch(isDarkMode, update, { immediate: true });
  });

  onUnmounted(() => {
    update();
  });
}
