<script setup>
import { ref } from 'vue';
import { Variant } from '@vitebook/vue';
import { Switch } from 'vant';

const checked = ref(true);
</script>

<template>
  <Variant name="Basic">
    <Switch v-model="checked" />
  </Variant>

  <Variant name="Disabled">
    <Switch v-model="checked" disabled />
  </Variant>

  <Variant name="Loading">
    <Switch v-model="checked" loading />
  </Variant>
</template>
