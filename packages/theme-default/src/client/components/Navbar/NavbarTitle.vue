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
  computed(() => theme.value.logo + '?raw&vue')
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

<style>
.navbar__title {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: 0.01rem;
  color: var(--vbk--navbar-title-color);
  transition: transform 150ms ease;
  padding-top: 0.2rem;
  padding-right: 0.2rem;
  text-decoration: none;
}

@media (hover: hover) and (pointer: fine) {
  .navbar__title:hover {
    text-decoration: none;
    backface-visibility: hidden;
    transform: scale(1.05) translateZ(0);
  }
}

.navbar__logo {
  width: 2rem;
  height: 2rem;
  margin-right: 0.2rem;
  vertical-align: middle;
  transition: var(--vbk--navbar-logo-transition);
  color: var(--vbk--navbar-logo-color);
}

.navbar__links__list,
.nav-item__menu {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}
</style>
