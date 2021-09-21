<script setup lang="ts">
import { useRouteLocale, withBaseUrl } from '@vitebook/client';
import { computed, ref, watchEffect } from 'vue';

import { defaultThemeLocaleOptions } from '../../shared';
import ButtonLink from '../components/ButtonLink.vue';
import { useDarkMode } from '../composables/useDarkMode';
import { useLocalizedThemeConfig } from '../composables/useLocalizedThemeConfig';

const homeLink = useRouteLocale();
const theme = useLocalizedThemeConfig();
const isDarkMode = useDarkMode();

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

const illustrationSrc = ref<string | undefined>(undefined);
watchEffect(() => {
  const illustrationDark = theme.value.notFoundPage?.illustrationDark;

  if (isDarkMode.value && illustrationDark) {
    illustrationSrc.value = illustrationDark;
    return;
  }

  illustrationSrc.value = illustration.value;
});
</script>

<template>
  <div class="not-found">
    <div class="not-found__container">
      <div class="not-found__img-container">
        <img :src="illustrationSrc" alt="404" />
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
