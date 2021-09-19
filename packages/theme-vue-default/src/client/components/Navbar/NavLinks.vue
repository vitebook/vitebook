<script setup lang="ts">
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import NavItemLink from './NavItemLink.vue';
import NavItemWithMenu from './NavItemWithMenu.vue';
import { useLanguageLinks } from './useLanguageLinks';
import { useHasNavbarItems } from './useNavbar';
import { useRepoLink } from './useRepoLink';

const themeConfig = useLocalizedThemeConfig();
const repoLink = useRepoLink();
const languageLinks = useLanguageLinks();
const hasNavItems = useHasNavbarItems();
</script>

<template>
  <nav v-if="hasNavItems">
    <ul>
      <template v-if="hasNavItems">
        <li
          v-for="item in themeConfig.navbar.items"
          :key="item.text"
          class="nav-item"
        >
          <NavItemWithMenu v-if="'menu' in item" :item="item" />
          <NavItemLink v-else :item="item" />
        </li>
      </template>

      <li v-if="languageLinks" class="nav-item">
        <NavItemWithMenu :item="languageLinks" />
      </li>

      <li v-if="repoLink" class="nav-item">
        <NavItemLink :item="repoLink" />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
nav > ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

ul > li {
  margin: 0;
  padding: 0;
}

@media (min-width: 992px) {
  nav > ul {
    flex-direction: row;
    align-items: center;
  }
}
</style>
