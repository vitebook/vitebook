<script setup lang="ts">
import { useRouteLocale, withBaseUrl } from '@vitebook/client';
import { computed } from 'vue';

import { defaultThemeLocaleOptions } from '../../shared';
import ButtonLink from '../components/ButtonLink.vue';
import { useDynamicAsyncComponent } from '../composables/useDynamicAsyncComponent';
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

const illustration = computed(
  () =>
    theme.value.notFoundPage?.illustration ??
    defaultThemeLocaleOptions.notFoundPage.illustration
);

const Illustration = useDynamicAsyncComponent(
  computed(() => illustration.value + '?raw')
);
</script>

<template>
  <div class="not-found">
    <div class="not-found__container">
      <div class="not-found__img-container">
        <keep-alive>
          <component :is="Illustration" />
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
