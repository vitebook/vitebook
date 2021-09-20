<script setup lang="ts">
import { useRouteLocale, withBaseUrl } from '@vitebook/client';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../../../shared';
import ButtonLink from '../../components/ButtonLink.vue';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NotFoundImage from './NotFoundImage.vue';

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
</script>

<template>
  <div class="not-found-page">
    <div class="container">
      <div class="img-container">
        <NotFoundImage />
      </div>

      <h1>{{ notFoundText }}</h1>

      <div class="actions">
        <ButtonLink class="home-link" :href="withBaseUrl(homeLink)">
          {{ goHomeText }}
        </ButtonLink>

        <ButtonLink class="back-link" href="_back" type="secondary">
          {{ goBackText }}
        </ButtonLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  width: 100%;
  min-height: 100%;
  padding: 0 2rem;
}

.container {
  width: 100%;
  padding-top: var(--navbar-height);
  min-height: calc(100vh - var(--navbar-height));
  margin: 0 auto;
  max-width: 960px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

h1 {
  font-size: 1.5rem;
  margin-top: 3rem;
  text-align: center;
}

.img-container {
  width: 100%;
  max-width: 400px;
}

.home-link {
  margin-top: 3rem;
}

.actions > a + a {
  margin-left: 1rem;
}

@media (min-width: 576px) {
  .container {
    padding-top: calc(var(--navbar-height) + 2rem);
  }

  .home-link {
    margin-top: 3.5rem;
  }

  .img-container {
    max-width: 500px;
  }

  h1 {
    font-size: 1.75rem;
    margin-top: 3.5rem;
  }
}
</style>
