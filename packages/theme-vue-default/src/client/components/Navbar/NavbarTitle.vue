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
    :aria-label="`${siteConfig.title}`"
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
}

.title:hover {
  text-decoration: none;
}

.logo {
  width: 2rem;
  height: 2rem;
  margin-right: 0.2rem;
  vertical-align: middle;
}
</style>
