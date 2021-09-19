<script setup lang="ts">
import { SidebarLink } from '@vitebook/core/shared';

const props = defineProps<{
  item: SidebarLink;
  depth: number;
}>();
</script>

<template>
  <li class="sidebar-item">{{ item.text }}</li>
</template>
