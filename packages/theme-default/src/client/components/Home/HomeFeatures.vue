<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

import type { DefaultThemeHomePageFeature } from '../../../shared';
import { useHomePageConfig } from './useHomePageConfig';

const homePageConfig = useHomePageConfig();

const hasFeatures = computed(
  () => (homePageConfig.value?.features?.length ?? 0) > 0
);

const features = computed<DefaultThemeHomePageFeature[]>(
  () => homePageConfig.value?.features ?? []
);

const icons = computed(() =>
  features.value
    .map((_, i) => `/@virtual/vitebook/icons/home-feature-${i}`)
    .map((path) => defineAsyncComponent(() => import(/* @vite-ignore */ path)))
);
</script>

<template>
  <div v-if="hasFeatures" class="home__features">
    <div class="home__features__container">
      <section
        v-for="(feature, index) in features"
        :key="index"
        class="home__features__item home__features__item--with-icon"
      >
        <div>
          <h2 v-if="feature.title" class="home__features__item__title">
            <component
              :is="icons[index]"
              class="home__features__item__icon"
            ></component>
            {{ feature.title }}
          </h2>
          <p v-if="feature.body" class="home__features__item__body">
            {{ feature.body }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
