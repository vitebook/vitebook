<script setup lang="ts">
import { useLocalizedSiteOptions } from '@vitebook/vue/client';
import { computed } from 'vue';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import ButtonLink from '../ButtonLink.vue';

const siteConfig = useLocalizedSiteOptions();
const themeConfig = useLocalizedThemeConfig();

const shouldShowHero = computed(() => themeConfig.value.homePage.heroText);

const heroText = computed(
  () => themeConfig.value.homePage.heroText ?? siteConfig.value.title
);

const hasPrimaryButton = computed(() => {
  const { homePage } = themeConfig.value;
  return homePage.primaryActionText && homePage.primaryActionLink;
});

const hasSecondaryButton = computed(() => {
  const { homePage } = themeConfig.value;
  return homePage.secondaryActionText && homePage.secondaryActionLink;
});
</script>

<template>
  <header v-if="shouldShowHero" class="home-hero">
    <h1 v-if="heroText" id="main-title" class="title">{{ heroText }}</h1>

    <div class="actions">
      <ButtonLink
        v-if="hasPrimaryButton"
        type="primary"
        :href="themeConfig.homePage.primaryActionLink ?? ''"
      >
        {{ themeConfig.homePage.primaryActionText }}
      </ButtonLink>

      <ButtonLink
        v-if="hasSecondaryButton"
        type="secondary"
        :href="themeConfig.homePage.secondaryActionLink ?? ''"
      >
        {{ themeConfig.homePage.secondaryActionText }}
      </ButtonLink>
    </div>
  </header>
</template>

<style scoped>
.home-hero {
  padding: 0 1.5rem;
  text-align: center;
  padding-top: 5rem;
}

.title {
  margin-top: 0;
}

@media (min-width: 992px) {
  .title {
    margin-top: 2rem;
  }

  .home-hero {
    margin-bottom: 5rem;
  }
}

.actions {
  margin-top: 3.75rem;
}

.actions > a + a {
  margin-left: 1rem;
}

@media (min-width: 576px) {
  .actions > a + a {
    margin-left: 2rem;
  }
}
</style>
