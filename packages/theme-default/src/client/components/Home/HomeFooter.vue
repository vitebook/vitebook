<script setup lang="ts">
import { useMarkdownPageMeta } from '@vitebook/client';
import { computed } from 'vue';

import { useHomePageConfig } from './useHomePageConfig';

const mdMeta = useMarkdownPageMeta();
const homePageConfig = useHomePageConfig();

const footerText = computed(
  () =>
    (mdMeta.value?.frontmatter.footer as string) ?? homePageConfig.value?.footer
);
</script>

<template>
  <footer v-if="footerText" class="home__footer">
    <div class="home__footer__container">
      <p class="home__footer-text">{{ footerText }}</p>
    </div>
  </footer>
</template>
