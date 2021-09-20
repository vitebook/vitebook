<script setup lang="ts">
import { useMarkdownFrontmatter } from '@vitebook/client';
import { computed } from 'vue';

import { useHomePageConfig } from './useHomePageConfig';

const frontmatter = useMarkdownFrontmatter();
const homePageConfig = useHomePageConfig();

const footerText = computed(
  () => frontmatter.value?.footer ?? homePageConfig.value?.footer
);
</script>

<template>
  <footer v-if="footerText" class="home__footer">
    <div class="home__footer__container">
      <p class="home__footer__text">{{ footerText }}</p>
    </div>
  </footer>
</template>
