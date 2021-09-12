<script setup lang="ts">
import { computed } from 'vue';

import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NavItemLink from './NavItemLink.vue';
import NavItemWithMenu from './NavItemWithMenu.vue';
import { useLanguageLinks } from './useLanguageLinks';
import { useRepoLink } from './useRepoLink';

const themeConfig = useLocalizedThemeConfig();
const repoLink = useRepoLink();
const languageLinks = useLanguageLinks();

const hasNavItems = computed(
  () => (themeConfig.value.navbar.items?.length ?? 0) > 0
);

const isShowing = computed(() => hasNavItems.value);
</script>

<template>
  <nav v-if="isShowing">
    <template v-if="hasNavItems">
      <div
        v-for="item in themeConfig.navbar.items"
        :key="item.text"
        class="nav-item"
      >
        <NavItemWithMenu v-if="'menu' in item" :item="item" />
        <NavItemLink v-else :item="item" />
      </div>
    </template>

    <div v-if="languageLinks" class="nav-item">
      <NavItemWithMenu :item="languageLinks" />
    </div>

    <div v-if="repoLink" class="nav-item">
      <NavItemLink :item="repoLink" />
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
}

@media (min-width: 992px) {
  nav {
    flex-direction: row;
    align-items: center;
  }
}
</style>
