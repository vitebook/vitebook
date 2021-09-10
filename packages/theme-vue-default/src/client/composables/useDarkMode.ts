import {
  useMutationObserver,
  usePreferredDark,
  useStorage
} from '@vueuse/core';
import {
  computed,
  onBeforeMount,
  onUnmounted,
  watch,
  WritableComputedRef
} from 'vue';

import { useLocalizedThemeConfig } from './useLocalizedThemeConfig';

export type DarkModeRef = WritableComputedRef<boolean>;

const themeLocale = useLocalizedThemeConfig();
const isDarkPreferred = usePreferredDark();
const darkStorage = useStorage('vitebook-color-scheme', 'auto');

const darkModeRef = computed<boolean>({
  get() {
    // Disable dark mode
    if (!themeLocale.value.darkMode.enabled) {
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

export function useDarkMode(): DarkModeRef {
  return darkModeRef;
}

export function initDarkMode(): void {
  updateHtmlDarkClass(darkModeRef);
}

function updateHtmlDarkClass(isDarkMode: DarkModeRef): void {
  const update = (value = isDarkMode.value): void => {
    // Set `class="dark"` on `<html>` element.
    const htmlEl = window?.document.querySelector('html');
    htmlEl?.classList.toggle('dark', value);
  };

  let stopObserver: () => void;
  const observe = (): void => {
    if (import.meta.env.DEV) {
      stopObserver?.();
      const htmlEl = window?.document.querySelector('html');
      if (htmlEl) {
        stopObserver = useMutationObserver(
          htmlEl,
          (records) => {
            const record = records[0];
            if (record.type === 'attributes') {
              const isDarkMode = htmlEl.classList.contains('dark');
              darkModeRef.value = isDarkMode;
            }
          },
          { attributeFilter: ['class'] }
        ).stop;
      }
    }
  };

  onBeforeMount(() => {
    watch(isDarkMode, update, { immediate: true });
    observe();
  });

  onUnmounted(() => {
    update();
    stopObserver?.();
  });
}
