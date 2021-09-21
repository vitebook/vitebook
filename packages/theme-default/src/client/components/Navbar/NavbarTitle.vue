<script setup lang="ts">
import {
  useLocalizedSiteOptions,
  useRouteLocale,
  withBaseUrl
} from '@vitebook/client';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../../../shared';
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
    class="navbar__title"
    :to="localePath"
    :aria-label="`${site.title}, ${goHomeText}`"
  >
    <img
      v-if="theme.logo"
      class="navbar__logo"
      :src="withBaseUrl(theme.logo)"
      :alt="`${site.title} logo`"
    />
    {{ site.title }}
  </router-link>
</template>
