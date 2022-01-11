<script lang="ts">
import type { PageMeta } from '@vitebook/client';

export const __pageMeta: PageMeta = {
  title: 'Button',
  description: 'My awesome button.',
};
</script>

<script setup lang="ts">
import Button from './Button.vue';
import {
  ControlsAddon,
  EventsAddon,
  eventCallback,
} from '@vitebook/vue/addons';
import { Variant } from '@vitebook/vue';

import { ref } from 'vue';

const title = ref('Click Me');
const disabled = ref(false);

function onEnterDisabledButton() {
  disabled.value = true;
}
</script>

<template>
  <Variant name="Default" description="The default button.">
    <Button :disabled="disabled" @click="eventCallback">{{ title }}</Button>
  </Variant>

  <Variant name="Disabled" description="The disabled button.">
    <Button :disabled="disabled" @enter="onEnterDisabledButton">{{
      title
    }}</Button>
  </Variant>

  <ControlsAddon>
    <div>Title: <input type="text" v-model="title" /></div>
    <div style="margin-top: 24px">
      Disabled: <input type="checkbox" v-model="disabled" />
    </div>
  </ControlsAddon>

  <EventsAddon />
</template>
