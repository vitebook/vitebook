<script setup lang="ts">
import { OutboundLink as RawOutboundLink } from '@vitebook/client';
import { computed } from 'vue';

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
  <RawOutboundLink>
    <span class="sr-only">{{ openInNewWindowText }}</span>
  </RawOutboundLink>
</template>

<style>
.icon.outbound {
  stroke: currentColor;
  color: var(--color-text);
}
</style>
