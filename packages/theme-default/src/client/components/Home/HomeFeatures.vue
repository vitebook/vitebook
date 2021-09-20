<script setup lang="ts">
import { withBaseUrl } from '@vitebook/client';
import { computed } from 'vue';

import type { DefaultThemeHomePageFeature } from '../../../shared';
import { useDarkMode } from '../../composables/useDarkMode';
import { useHomePageConfig } from './useHomePageConfig';

const isDarkMode = useDarkMode();
const homePageConfig = useHomePageConfig();

const hasFeatures = computed(
  () => (homePageConfig.value?.features?.length ?? 0) > 0
);

const features = computed<DefaultThemeHomePageFeature[]>(
  () => homePageConfig.value?.features ?? []
);

function hasIcon(feature: DefaultThemeHomePageFeature): boolean {
  const icon = isDarkMode.value ? feature.iconDark : feature.icon;
  return !!icon;
}

function resolveFeatureIcon(feature: DefaultThemeHomePageFeature) {
  const icon = isDarkMode.value ? feature.iconDark : feature.icon;
  const src = icon?.startsWith('/')
    ? withBaseUrl(icon)
    : `data:image/svg+xml;base64,${icon}`;
  return icon ? src : undefined;
}
</script>

<template>
  <div v-if="hasFeatures" class="home-features">
    <div class="features">
      <section
        v-for="(feature, index) in features"
        :key="index"
        class="feature"
        :class="{
          'with-icon': hasIcon(feature)
        }"
      >
        <img
          v-if="hasIcon(feature)"
          class="icon"
          :alt="feature.iconAlt ?? 'feature icon'"
          :src="resolveFeatureIcon(feature)"
        />

        <div>
          <h2 v-if="feature.title" class="title">{{ feature.title }}</h2>
          <p v-if="feature.body" class="body">{{ feature.body }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-features {
  margin: 0 auto;
  max-width: 960px;
  margin-top: 3.75rem;
  padding: 0 1rem;
}

.features {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: stretch;
  justify-content: space-between;
  padding-left: 2rem;
  padding-right: 1rem;
}

.feature {
  display: flex;
  flex-direction: row;
  align-items: start;
  flex-grow: 1;
  flex-basis: 100%;
  max-width: 100%;
  text-align: left;
}

.feature:first-child > .title {
  margin-top: 0;
}
.title {
  border-bottom: 0;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.icon {
  display: inline-block;
  padding-top: 0.3rem;
  padding-right: 1rem;
}

.feature.with-icon {
  margin-top: 2.25rem;
}

.feature.with-icon .title {
  margin-top: 0;
}

.body {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

@media (min-width: 576px) {
  .home-features {
    padding-left: 2rem;
  }

  .features {
    padding-left: 0;
    padding-right: 0;
  }

  .feature {
    flex-basis: 48%;
    max-width: 48%;
  }

  .feature:first-child > .title {
    margin-top: 2.25rem;
  }
}

@media (min-width: 992px) {
  .home-features {
    padding-left: 3.1rem;
  }

  .feature {
    flex-basis: 30%;
    max-width: 30%;
  }
}
</style>
