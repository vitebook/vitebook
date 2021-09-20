<script setup lang="ts">
import {
  useLocalizedSiteOptions,
  useRouteLocale,
  withBaseUrl
} from '@vitebook/client';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../..';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const localePath = useRouteLocale();
const site = useLocalizedSiteOptions();
const theme = useLocalizedThemeConfig();

const goHomeText = computed(
  () =>
    theme.value.notFoundPage?.goHomeText ??
    defaultThemeLocaleOptions.notFoundPage.goHomeText
);
</script>

<template>
  <router-link
    class="title"
    :to="localePath"
    :aria-label="`${site.title}, ${goHomeText}`"
  >
    <img
      v-if="theme.logo"
      class="logo"
      :src="withBaseUrl(theme.logo)"
      :alt="`${site.title} logo`"
    />
    {{ site.title }}
  </router-link>
</template>

<style scoped>
.title {
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--color-text);
  transition: transform 150ms ease;
  padding-top: 0.2rem;
  padding-right: 0.2rem;
  text-decoration: none;
}

@media (hover: hover) and (pointer: fine) {
  .title:hover {
    text-decoration: none;
    transform: scale(1.02);
  }
}

.logo {
  width: 2rem;
  height: 2rem;
  margin-right: 0.2rem;
  vertical-align: middle;
}
</style>
