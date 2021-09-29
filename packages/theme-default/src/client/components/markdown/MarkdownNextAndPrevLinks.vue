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

<style>
.md-footer__pagination-nav {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 3rem;
}

.md-footer__pagination-nav-item {
  flex: 1 50%;
  max-width: 50%;
}

.md-footer__pagination-nav-item.next {
  margin-left: 1.25rem;
}

.md-footer__pagination-nav-item.prev .md-footer__pagination-nav-item__link {
  align-items: flex-start;
}

.md-footer__pagination-nav-item__link {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  border: var(--vbk--menu-border);
  border-radius: 0.15rem;
  padding: 1.25rem;
  box-shadow: var(--vbk--elevation-small) !important;
  transition: transform 150ms ease;
}

.md-footer__pagination-nav-item__link:hover {
  text-decoration: none;
}

.md-footer__pagination-nav-item__title {
  display: block;
  font-size: 0.875rem;
  color: var(--vbk--color-text);
}

.md-footer__pagination-nav-item__text {
  display: flex;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.md-footer__pagination-nav-item.prev svg {
  margin-right: 0.375rem;
}

.md-footer__pagination-nav-item.next svg {
  margin-left: 0.375rem;
}

@media (hover: hover) and (pointer: fine) {
  .md-footer__pagination-nav-item__link:hover {
    backface-visibility: hidden;
    transform: scale(1.02) translateZ(0);
    text-decoration: none;
    box-shadow: var(--vbk--elevation-medium) !important;
  }
}
</style>
