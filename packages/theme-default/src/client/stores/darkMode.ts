import { inBrowser } from '@vitebook/client';
import { onMount } from 'svelte';
import { get, writable } from 'svelte/store';

import { DefaultThemeConfig, defaultThemeLocaleOptions } from '../../shared';
import { localizedThemeConfig } from './localizedThemeConfig';

export const darkMode = writable(false);

const STORAGE_KEY = 'vitebook-color-scheme';

function isDarkPreferred() {
  return inBrowser
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

function savedValue() {
  return inBrowser
    ? window.localStorage.getItem(STORAGE_KEY) ?? 'auto'
    : 'auto';
}

export function useDarkMode(): void {
  function updateDarkMode(theme: DefaultThemeConfig) {
    const isEnabled =
      theme.darkMode?.enabled ?? defaultThemeLocaleOptions.darkMode.enabled;

    // Disable dark mode
    if (!isEnabled) {
      darkMode.set(false);
      return;
    }

    const darkModePreference = savedValue();

    // Auto detected from prefers-color-scheme
    if (darkModePreference === 'auto') {
      darkMode.set(isDarkPreferred());
      return;
    }

    darkMode.set(darkModePreference === 'dark');
  }

  updateDarkMode(get(localizedThemeConfig));
  updateHtmlDarkDataAttr(get(darkMode));

  onMount(() => {
    return localizedThemeConfig.subscribe(updateDarkMode);
  });

  onMount(() => {
    return darkMode.subscribe((isDark) => {
      updateHtmlDarkDataAttr(isDark);

      if (isDark === isDarkPreferred()) {
        window.localStorage.setItem(STORAGE_KEY, 'auto');
      } else {
        window.localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
      }
    });
  });
}

function updateHtmlDarkDataAttr(isDarkMode: boolean): void {
  if (!inBrowser) return;
  const htmlEl = window?.document.querySelector('html');
  htmlEl?.setAttribute('data-vbk-theme', isDarkMode ? 'dark' : 'light');
}
