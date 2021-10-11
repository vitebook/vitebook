<script setup lang="ts">
import { useRouteLocale, withBaseUrl } from '@vitebook/client';
import { computed, defineAsyncComponent } from 'vue';

import { defaultThemeLocaleOptions } from '../../shared';
import ButtonLink from '../components/ButtonLink.vue';
import { useLocalizedThemeConfig } from '../composables/useLocalizedThemeConfig';

const homeLink = useRouteLocale();
const theme = useLocalizedThemeConfig();

const notFoundText = computed(
  () =>
    theme.value.notFoundPage?.message ??
    defaultThemeLocaleOptions.notFoundPage.message
);

const goHomeText = computed(
  () =>
    theme.value.notFoundPage?.goHomeText ??
    defaultThemeLocaleOptions.notFoundPage.goHomeText
);

const goBackText = computed(
  () =>
    theme.value.notFoundPage?.goBackText ??
    defaultThemeLocaleOptions.notFoundPage.goBackText
);

const Illustration = defineAsyncComponent(
  async () => await import(':virtual/vitebook/404.svg')
);
</script>

<template>
  <div class="not-found">
    <div class="not-found__container">
      <div class="not-found__img-container">
        <keep-alive>
          <component :is="Illustration" :width="`100%`" />
        </keep-alive>
      </div>

      <h1 class="not-found__title">{{ notFoundText }}</h1>

      <div class="not-found__actions">
        <ButtonLink
          class="not-found__actions__primary"
          :href="withBaseUrl(homeLink)"
        >
          {{ goHomeText }}
        </ButtonLink>

        <ButtonLink
          class="not-found__actions__secondary"
          href="_back"
          type="secondary"
        >
          {{ goBackText }}
        </ButtonLink>
      </div>
    </div>
  </div>
</template>

<style>
.not-found {
  width: 100%;
  min-height: 100%;
  padding: 0 2rem;
}

.not-found__container {
  width: 100%;
  padding-top: 0.5rem;
  margin: 0 auto;
  max-width: 960px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.not-found__title {
  margin: 0;
  padding: 0;
  font-size: 1.75rem;
  line-height: 1.5;
  margin-top: 1rem;
  margin-bottom: 3.5rem;
  text-align: center;
  justify-content: center;
}

.not-found__img-container {
  max-width: 400px;
}

.not-found__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -1.5rem;
}

.not-found__actions > a + a {
  margin-left: 1rem;
}

@media (min-width: 420px) {
  .not-found__title {
    font-size: 1.75rem;
    margin-top: 2.5rem;
  }

  .not-found__container {
    padding-top: 2rem;
  }
}

@media (min-width: 576px) {
  .not-found__container {
    padding-top: 4rem;
  }

  .not-found__img-container {
    max-width: 500px;
  }

  .not-found__title {
    font-size: 2rem;
    margin-top: 3.5rem;
    margin-bottom: 3.5rem;
  }
}
</style>
