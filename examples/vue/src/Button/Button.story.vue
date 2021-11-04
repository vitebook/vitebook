<script lang="ts">
import type { PageMeta } from '@vitebook/client';

export const __pageMeta: PageMeta = {
  title: 'Button',
  description: 'My awesome button.',
};
</script>

<script setup lang="ts">
import Button from './Button.vue';
import { Variant } from '@vitebook/vue';
</script>

<template>
  <Variant name="Default" description="The default button.">
    <Button />
  </Variant>

  <Variant name="Disabled" description="The disabled button.">
    <Button disabled />
  </Variant>
</template>
