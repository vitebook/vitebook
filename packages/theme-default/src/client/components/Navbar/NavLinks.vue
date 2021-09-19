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
    <ul class="nav-links">
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
:deep(ul) {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

:deep(li) {
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(a),
:deep(button) {
  display: flex;
  align-items: center;
  padding: 0.68rem 0.5rem;
  font-size: 1rem;
  border: 0;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 0.12rem;
  color: var(--color-text);
  white-space: nowrap;
  text-decoration: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
  background-color: transparent;
}

:deep(a.active > span) {
  color: var(--color-primary);
}

@media (hover: hover) and (pointer: fine) and (max-width: 991px) {
  :deep(a:hover),
  :deep(button:hover) {
    background-color: var(--color-bg-100);
  }
}

@media (hover: hover) and (min-width: 992px) {
  :deep(a:hover > span) {
    color: var(--color-text);
    border-bottom: 0.12rem solid var(--color-primary);
  }
}

@media (min-width: 992px) {
  .nav-links {
    flex-direction: row;
    align-items: center;
  }

  :deep(a),
  :deep(button) {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
  }

  :deep(a.active > span) {
    color: var(--color-text);
    border-bottom: 0.12rem solid var(--color-primary);
  }
}
</style>
