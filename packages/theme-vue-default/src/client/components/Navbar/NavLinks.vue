<script setup lang="ts">
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const themeConfig = useLocalizedThemeConfig();

const navItems = themeConfig.value.navbar.items ?? [];

// export type NavbarItemsConfig = (NavbarItemLink | NavbarItemGroup)[];

// export type NavbarItem = {
//   text: string;
//   target?: string;
//   rel?: string;
//   ariaLabel?: string;
//   activeMatch?: string;
// };

// export type NavbarItemLink = NavbarItem & {
//   link: string;
// };

// export type NavbarItemGroup = NavbarItem & {
//   children: NavbarItemLink[];
// };
</script>

<template>
  <span>Links</span>
</template>
