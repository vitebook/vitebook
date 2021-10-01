<script setup lang="ts">
import { computed } from 'vue';

import DarkIcon from ':virtual/vitebook/icons/theme-switch-dark?raw&vue';
import LightIcon from ':virtual/vitebook/icons/theme-switch-light?raw&vue';

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
    class="theme-switch"
    role="switch"
    :aria-label="buttonAriaLabel"
    :aria-checked="isDarkMode"
    @pointerdown="onToggle"
    @keydown.enter="onToggle"
  >
    <LightIcon class="theme-switch__icon light" />
    <DarkIcon class="theme-switch__icon dark" />
  </button>
</template>

<style>
.theme-switch {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  margin: 0;
  padding: 0.5rem;
  font-size: 1.375rem;
  border-radius: 0.15rem;
  min-width: 2.649375rem;
  min-height: 2.649375rem;
  cursor: pointer;
  color: var(--vbk--toggle-color);
  background-color: var(--vbk--toggle-bg-color);
  transition: opacity 200ms ease, transform 200ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .theme-switch:hover {
    outline: 0;
    color: var(--vbk--toggle-hover-color);
    background-color: var(--vbk--toggle-hover-bg-color);
  }
}

.theme-switch__icon {
  position: absolute;
  transition: transform 300ms ease, opacity 200ms ease-out;
}

.theme-switch__icon.light {
  opacity: 1;
  transform: rotate(0deg);
}

html.dark .theme-switch__icon.light {
  opacity: 0;
  transform: rotate(45deg);
}

.theme-switch__icon.dark {
  opacity: 0;
  transform: rotate(-45deg);
}

html.dark .theme-switch__icon.dark {
  opacity: 1;
  transform: rotate(0deg);
}
</style>
