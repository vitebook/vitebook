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
    .map((_, i) => `/:virtual/vitebook/icons/home-feature-${i}?raw&vue`)
    .map((path) => defineAsyncComponent(() => import(/* @vite-ignore */ path)))
);
</script>

<template>
  <div v-if="hasFeatures" class="home__features">
    <div class="home__features__container">
      <section
        v-for="(feature, index) in features"
        :key="index"
        class="home__feature with-icon"
      >
        <div>
          <h2 v-if="feature.title" class="home__feature__title">
            <component
              :is="icons[index]"
              class="home__feature__icon"
            ></component>
            {{ feature.title }}
          </h2>
          <p v-if="feature.body" class="home__feature__body">
            {{ feature.body }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.home__features {
  margin: 0 auto;
  max-width: 960px;
  margin-top: 3.5rem;
  padding: 0 1rem;
}

.home__features__container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: stretch;
  justify-content: space-between;
  padding-left: 2rem;
  padding-right: 1rem;
}

.home__feature {
  display: flex;
  flex-direction: row;
  align-items: start;
  flex-grow: 1;
  flex-basis: 100%;
  max-width: 100%;
  text-align: left;
  margin-top: 2.5rem;
}

.home__feature:first-child {
  margin-top: 0;
}

.home__feature__title {
  display: flex;
  align-items: center;
  border-bottom: 0;
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  padding: 0;
}

.home__feature__icon {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.home__feature__body {
  font-size: 0.9rem;
  margin: 0;
  margin-top: 0.5rem;
}

@media (min-width: 576px) {
  .home__features {
    padding-left: 2.5rem;
    max-width: 760px;
  }

  .home__features__container {
    padding-left: 0;
    padding-right: 0;
  }

  .home__feature {
    flex-basis: 48%;
    max-width: 48%;
  }

  .home__feature:first-child .home__feature__title {
    margin-top: 2.25rem;
  }
}

@media (min-width: 992px) {
  .home__features {
    padding-left: 4rem;
    max-width: 960px;
  }

  .home__feature {
    flex-basis: 30%;
    max-width: 30%;
  }
}
</style>
