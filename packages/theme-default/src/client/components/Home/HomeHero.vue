<script setup lang="ts">
import { useLocalizedSiteOptions } from '@vitebook/client';
import { computed } from 'vue';

import ButtonLink from '../ButtonLink.vue';
import { useHomePageConfig } from './useHomePageConfig';

const site = useLocalizedSiteOptions();
const homePageConfig = useHomePageConfig();

const shouldShowHero = computed(() => homePageConfig.value?.heroText);

const heroText = computed(
  () => homePageConfig.value?.heroText ?? site.value.title
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
  <header v-if="shouldShowHero" class="home__hero">
    <h1 v-if="heroText" id="main-title" class="home__hero__title">
      {{ heroText }}
    </h1>

    <div class="home__hero__actions">
      <ButtonLink
        v-if="hasPrimaryButton"
        type="primary"
        :href="homePageConfig?.primaryActionLink ?? ''"
        clas="home__hero__actions__primary"
      >
        {{ homePageConfig?.primaryActionText }}
      </ButtonLink>

      <ButtonLink
        v-if="hasSecondaryButton"
        type="secondary"
        :href="homePageConfig?.secondaryActionLink ?? ''"
        clas="home__hero__actions__secondary"
      >
        {{ homePageConfig?.secondaryActionText }}
      </ButtonLink>
    </div>
  </header>
</template>
