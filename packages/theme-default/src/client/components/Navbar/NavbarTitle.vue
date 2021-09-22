<script setup lang="ts">
import { useLocalizedSiteOptions, useRouteLocale } from '@vitebook/client';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../../../shared';
import { useDynamicAsyncComponent } from '../../composables/useDynamicAsyncComponent';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const localePath = useRouteLocale();
const site = useLocalizedSiteOptions();
const theme = useLocalizedThemeConfig();

const goHomeText = computed(
  () =>
    theme.value.notFoundPage?.goHomeText ??
    defaultThemeLocaleOptions.notFoundPage.goHomeText
);

const Logo = useDynamicAsyncComponent(
  computed(() => theme.value.logo + '?raw')
);
</script>

<template>
  <router-link
    class="navbar__title"
    :to="localePath"
    :aria-label="`${site.title}, ${goHomeText}`"
  >
    <div class="navbar__logo">
      <keep-alive>
        <component :is="Logo" />
      </keep-alive>
    </div>
    {{ site.title }}
  </router-link>
</template>
