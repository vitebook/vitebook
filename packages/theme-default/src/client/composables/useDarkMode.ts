import { usePreferredDark, useStorage } from '@vueuse/core';
import {
  computed,
  onBeforeMount,
  onUnmounted,
  watch,
  WritableComputedRef
} from 'vue';

import { defaultThemeLocaleOptions } from '../../shared';
import { useLocalizedThemeConfig } from './useLocalizedThemeConfig';

export type DarkModeRef = WritableComputedRef<boolean>;

const theme = useLocalizedThemeConfig();
const isDarkPreferred = usePreferredDark();
const darkStorage = useStorage('vitebook-color-scheme', 'auto');

const darkModeRef = computed<boolean>({
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

  onBeforeMount(() => {
    watch(isDarkMode, update, { immediate: true });
  });

  onUnmounted(() => {
    update();
  });
}
