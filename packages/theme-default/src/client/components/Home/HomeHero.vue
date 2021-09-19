<script setup lang="ts">
import { useLocalizedSiteOptions } from '@vitebook/client';
import { computed } from 'vue';

import ButtonLink from '../ButtonLink.vue';
import { useHomePageConfig } from './useHomePageConfig';

const siteConfig = useLocalizedSiteOptions();
const homePageConfig = useHomePageConfig();

const shouldShowHero = computed(() => homePageConfig.value?.heroText);

const heroText = computed(
  () => homePageConfig.value?.heroText ?? siteConfig.value.title
);

const hasPrimaryButton = computed(() => {
  const homePage = homePageConfig.value;
  return homePage?.primaryActionText && homePage?.primaryActionLink;
});

const hasSecondaryButton = computed(() => {
  const homePage = homePageConfig.value;
  return homePage?.secondaryActionText && homePage?.secondaryActionLink;
});
</script>

<template>
  <header v-if="shouldShowHero" class="home-hero">
    <h1 v-if="heroText" id="main-title" class="title">{{ heroText }}</h1>

    <div class="actions">
      <ButtonLink
        v-if="hasPrimaryButton"
        type="primary"
        :href="homePageConfig?.primaryActionLink ?? ''"
      >
        {{ homePageConfig?.primaryActionText }}
      </ButtonLink>

      <ButtonLink
        v-if="hasSecondaryButton"
        type="secondary"
        :href="homePageConfig?.secondaryActionLink ?? ''"
      >
        {{ homePageConfig?.secondaryActionText }}
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

@media (min-width: 992px) {
  .title {
    margin-top: 2rem;
  }

  .home-hero {
    margin-bottom: 5rem;
  }
}
</style>
