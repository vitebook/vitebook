<script setup lang="ts">
import { useMarkdownPageMeta } from '@vitebook/client';
import { computed, onMounted, ref } from 'vue';

import { defaultThemeLocaleOptions } from '../..';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const pageMeta = useMarkdownPageMeta();
const theme = useLocalizedThemeConfig();

const lastUpdated = computed(() => pageMeta.value?.lastUpdated);

const isEnabled = computed(
  () =>
    pageMeta.value?.frontmatter.lastUpdated ??
    theme.value.markdown?.lastUpdated ??
    defaultThemeLocaleOptions.markdown.lastUpdated
);

const lastUpdatedText = computed(
  () =>
    theme.value.markdown?.lastUpdatedText ??
    defaultThemeLocaleOptions.markdown.lastUpdatedText
);

const datetime = ref('');

onMounted(() => {
  // Locale string might be different based on end user and will lead to potential hydration
  // mismatch if calculated at build time.
  datetime.value = new Date(lastUpdated.value ?? 0).toLocaleDateString(
    'en-US',
    {}
  );
});
</script>

<template>
  <p v-if="lastUpdated && isEnabled" class="md-footer__last-updated">
    <span class="md-footer__last-updated__text">{{ lastUpdatedText }}</span>
    <span class="md-footer__last-updated__date">{{ datetime }}</span>
  </p>
</template>
