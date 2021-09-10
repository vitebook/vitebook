<script setup lang="ts">
import { useMarkdownFrontmatter } from '@vitebook/vue/client';
import { computed } from 'vue';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const themeConfig = useLocalizedThemeConfig();
const frontmatter = useMarkdownFrontmatter();

const footerText = computed(
  () => frontmatter.value?.footer ?? themeConfig.value.homePage.footer
);
</script>

<template>
  <footer v-if="footerText" class="footer">
    <div class="container">
      <p class="text">{{ footerText }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin: 0 auto;
  max-width: 960px;
}

.container {
  padding: 4rem 1.5rem 5rem;
}

@media (min-width: 768px) {
  .container {
    padding: 6rem 1.5rem 4rem;
  }
}

.text {
  margin: 0;
  text-align: center;
  line-height: 1.4;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}
</style>
