<script setup lang="ts">
import NavItemLink from './NavItemLink.vue';
import NavItemWithMenu from './NavItemWithMenu.vue';
import { useLanguageLinks } from './useLanguageLinks';
import { useHasNavbarItems, useNavbarConfig } from './useNavbar';
import { useRepoLink } from './useRepoLink';

const navbar = useNavbarConfig();
const repoLink = useRepoLink();
const languageLinks = useLanguageLinks();
const hasNavItems = useHasNavbarItems();
</script>

<template>
  <nav v-if="hasNavItems" class="navbar__links">
    <ul class="navbar__links__list">
      <template v-if="hasNavItems">
        <li
          v-for="item in navbar?.items ?? []"
          :key="item.text"
          class="navbar__links__list-item"
        >
          <NavItemWithMenu v-if="'menu' in item" :item="item" />
          <NavItemLink v-else :item="item" />
        </li>
      </template>

      <li v-if="languageLinks" class="navbar__links__list-item">
        <NavItemWithMenu :item="languageLinks" />
      </li>

      <li v-if="repoLink" class="navbar__links__list-item">
        <NavItemLink :item="repoLink" />
      </li>
    </ul>
  </nav>
</template>
