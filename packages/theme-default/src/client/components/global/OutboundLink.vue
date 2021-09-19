<script setup lang="ts">
import { OutboundLink as RawOutboundLink } from '@vitebook/client';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const themeLocale = useLocalizedThemeConfig();
</script>

<template>
  <RawOutboundLink>
    <span class="sr-only">{{ themeLocale.a11y.openInNewWindow }}</span>
  </RawOutboundLink>
</template>

<style>
.icon.outbound {
  stroke: currentColor;
  color: var(--color-text);
}
</style>
