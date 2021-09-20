<script setup lang="ts">
import DarkIcon from '@virtual/vitebook/icons/theme-switch-dark';
import LightIcon from '@virtual/vitebook/icons/theme-switch-light';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../../shared';
import { useDarkMode } from '../composables/useDarkMode';
import { useLocalizedThemeConfig } from '../composables/useLocalizedThemeConfig';

const isDarkMode = useDarkMode();
const theme = useLocalizedThemeConfig();

function onToggle() {
  isDarkMode.value = !isDarkMode.value;
}

const isDarkModeEnabled = computed(
  () =>
    theme.value.darkMode?.enabled ?? defaultThemeLocaleOptions.darkMode.enabled
);

const buttonAriaLabel = computed(
  () =>
    theme.value.darkMode?.buttonAriaLabel ??
    defaultThemeLocaleOptions.darkMode.buttonAriaLabel
);
</script>

<template>
  <button
    v-if="isDarkModeEnabled"
    role="switch"
    :aria-label="buttonAriaLabel"
    :aria-checked="isDarkMode"
    @pointerdown="onToggle"
    @keydown.enter="onToggle"
  >
    <LightIcon class="icon sun" />
    <DarkIcon class="icon moon" />
  </button>
</template>

<style scoped>
button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  margin: 0;
  padding: 0.5rem;
  font-size: 1.25rem;
  border-radius: 0.125rem;
  cursor: pointer;
  background-color: transparent;
}

@media (hover: hover) and (pointer: fine) {
  button:hover {
    outline: 0;
    background-color: var(--color-bg-100);
  }
}

.icon {
  display: block;
  color: var(--color-text);
  fill: currentColor;
}

html.dark .sun {
  display: none;
}

html.dark .moon {
  display: block;
}

html:not(.dark) .moon {
  display: none;
}
</style>
