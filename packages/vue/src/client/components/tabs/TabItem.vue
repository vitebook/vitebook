<script setup lang="ts">
import { toTitleCase } from '@vitebook/core';
import { onBeforeUnmount, ref } from 'vue';
import { useTabsRegistry } from './useTabsRegistry';

const { value, label } = withDefaults(
  defineProps<{
    value: string;
    label?: string | null;
  }>(),
  { label: ({ value }) => (value ? toTitleCase(value) : 'Unknown') },
);

const { addTab, selectTab, currentValue } = useTabsRegistry();

addTab({ value, label: label! });

const selected = ref(false);

onBeforeUnmount(
  currentValue.subscribe(($currentValue) => {
    selected.value = $currentValue === value;
  }),
);

function onSelect() {
  selectTab(value);
}
</script>

<template>
  <li
    class="tab __vbk__"
    role="tab"
    tabindex="0"
    :class="{ selected }"
    :aria-selected="selected ? 'true' : 'false'"
    @pointerdown="onSelect"
    @keydown="(e) => e.key === 'Enter' && onSelect()"
  >
    <slot>{{ label }}</slot>
  </li>
</template>

<style scoped>
.tab[role='tab'] {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.15rem;
  margin: 0;
  cursor: pointer;
  border-radius: 0 !important;
  font-weight: 500;
  transition: var(--vbk--color-transition);
}

.tab.selected {
  color: var(--vbk--color-primary);
  border-bottom: 0.15rem solid var(--vbk--color-primary);
}
</style>
