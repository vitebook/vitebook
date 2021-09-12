<script setup lang="ts">
import { useRouteLocale, withBaseUrl } from '@vitebook/vue/client';

import ButtonLink from '../../components/ButtonLink.vue';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NotFoundImage from './NotFoundImage.vue';

const homeLink = useRouteLocale();
const themeConfig = useLocalizedThemeConfig();
</script>

<template>
  <main class="404">
    <div class="container">
      <div class="img-container">
        <NotFoundImage />
      </div>

      <h1>
        {{ themeConfig.notFoundPage.message }}
      </h1>

      <ButtonLink class="home-link" :href="withBaseUrl(homeLink)">{{
        themeConfig.notFoundPage.backToHomeText
      }}</ButtonLink>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  background-color: var(--color-bg-200);
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

@media (min-width: 576px) {
  .container {
    padding-top: calc(var(--navbar-height) + 2rem);
  }
}

h1 {
  font-size: 1.5rem;
  margin-top: 3rem;
  text-align: center;
}

@media (min-width: 576px) {
  h1 {
    font-size: 1.75rem;
    margin-top: 3.5rem;
  }
}

.img-container {
  width: 100%;
  max-width: 400px;
}

@media (min-width: 576px) {
  .img-container {
    max-width: 500px;
  }
}

.home-link {
  margin-top: 3rem;
}

@media (min-width: 576px) {
  .home-link {
    margin-top: 3.5rem;
  }
}
</style>
