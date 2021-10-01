<script setup lang="ts">
import { computed } from 'vue';

import ExternalLinkIcon from ':virtual/vitebook/icons/external-link?raw&vue';

import { defaultThemeLocaleOptions } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const theme = useLocalizedThemeConfig();

const openInNewWindowText = computed(
  () =>
    theme.value.a11y?.openInNewWindow ??
    defaultThemeLocaleOptions.a11y.openInNewWindow
);
</script>

<template>
  <span>
    <ExternalLinkIcon />
    <span class="sr-only">{{ openInNewWindowText }}</span>
  </span>
</template>

<style scoped>
span {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}
</style>
