<script setup lang="ts">
import {
  useLocalizedSiteOptions,
  useRouteLocale,
  withBaseUrl
} from '@vitebook/vue/client';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const siteConfig = useLocalizedSiteOptions();
const themeConfig = useLocalizedThemeConfig();
const localePath = useRouteLocale();
</script>

<template>
  <router-link
    class="title"
    :to="localePath"
    :aria-label="`${siteConfig.title}, ${themeConfig.notFoundPage.goHomeText}`"
  >
    <img
      v-if="themeConfig.logo"
      class="logo"
      :src="withBaseUrl(themeConfig.logo)"
      :alt="`${siteConfig.title} logo`"
    />
    {{ siteConfig.title }}
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
