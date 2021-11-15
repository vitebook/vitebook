<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useTabsRegistry } from './useTabsRegistry';

const { value } = defineProps<{
  value: string;
}>();

const { currentValue } = useTabsRegistry();

const selected = ref(false);

onBeforeUnmount(
  currentValue.subscribe(($currentValue) => {
    selected.value = $currentValue === value;
  }),
);
</script>

<template>
  <div class="tabs__panel" role="tabpanel" :hidden="!selected">
    <slot />
  </div>
</template>
