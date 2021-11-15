<script setup lang="ts">
import { isString } from '@vitebook/core';
import { createTabsRegistry } from '@vitebook/client';
import type { TabsRegistryItem } from '@vitebook/client';
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { provideTabsRegistry } from './useTabsRegistry';
import TabItem from './TabItem.vue';

const { values, defaultValue, groupId } = withDefaults(
  defineProps<{
    values?: TabsRegistryItem[];
    defaultValue?: string | null;
    groupId?: string | null;
  }>(),
  // @ts-expect-error - `withDefaults` type issue.
  { values: [], defaultValue: null, groupId: null },
);

const registry = createTabsRegistry([...values!], {
  defaultValue,
  groupId,
  onMount: onBeforeMount,
  onDestroy: onBeforeUnmount,
});

provideTabsRegistry(registry);
</script>

<template>
  <div class="tabs">
    <ul class="tabs__list" role="tablist" aria-orientation="horizontal">
      <TabItem
        v-for="value in values.filter(isString)"
        :key="value"
        :value="value"
      />

      <slot name="tablist" />
    </ul>

    <div class="tabs__panels">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.tabs {
  width: 100%;
  border: var(--vbk--menu-border);
  margin: 1.15rem 0;
}

.tabs__list {
  display: flex;
  align-items: center;
  width: 100%;
  list-style: none;
  padding: 0.2rem;
  margin: 0;
  overflow-x: auto;
  background-color: var(--vbk--color-bg-200);
}

.tabs__panels {
  padding: 1.15rem;
}
</style>
