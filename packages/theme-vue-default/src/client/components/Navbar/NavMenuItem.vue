<script setup lang="ts">
import { NavItemLink } from '@vitebook/core/shared';

import NavLink from './NavItemLink.vue';

const props = defineProps<{
  item: NavItemLink;
}>();
</script>

<template>
  <div class="menu-item">
    <NavLink :item="item" />
  </div>
</template>

<style scoped>
:deep(.item) {
  padding: 0.1rem 1rem;
}
</style>
