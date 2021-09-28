<script setup lang="ts">
import { withBaseUrl } from '@vitebook/client';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../..';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import { useNextAndPrevLinks } from './useNextAndPrevLinks';

const theme = useLocalizedThemeConfig();
const { next, prev, hasLinks } = useNextAndPrevLinks();

const nextLinkText = computed(
  () =>
    theme.value.markdown?.nextLinkText ??
    defaultThemeLocaleOptions.markdown.nextLinkText
);

const prevLinkText = computed(
  () =>
    theme.value.markdown?.prevLinkText ??
    defaultThemeLocaleOptions.markdown.prevLinkText
);
</script>

<template>
  <div v-if="hasLinks" class="md-footer__pagination-nav">
    <div class="md-footer__pagination-nav-item prev">
      <RouterLink
        v-if="prev"
        :to="withBaseUrl(prev.link)"
        class="md-footer__pagination-nav-item__link"
      >
        <span class="md-footer__pagination-nav-item__title">
          {{ prevLinkText }}
        </span>
        <span class="md-footer__pagination-nav-item__text">
          « {{ prev.text }}
        </span>
      </RouterLink>
    </div>

    <div class="md-footer__pagination-nav-item next">
      <RouterLink
        v-if="next"
        :to="withBaseUrl(next.link)"
        class="md-footer__pagination-nav-item__link"
      >
        <span class="md-footer__pagination-nav-item__title">
          {{ nextLinkText }}
        </span>
        <span class="md-footer__pagination-nav-item__text">
          {{ next.text }} »
        </span>
      </RouterLink>
    </div>
  </div>
</template>
