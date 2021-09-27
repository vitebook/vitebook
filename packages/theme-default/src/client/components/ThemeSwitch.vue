<script setup lang="ts">
import { computed } from 'vue';

import DarkIcon from ':virtual/vitebook/icons/theme-switch-dark';
import LightIcon from ':virtual/vitebook/icons/theme-switch-light';

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
