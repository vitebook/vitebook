<script setup>
import { Variant } from '@vitebook/vue';
import { Picker } from 'vant';

const states = {
  Group1: ['Delaware', 'Florida', 'Georqia', 'Indiana', 'Maine'],
  Group2: ['Alabama', 'Kansas', 'Louisiana', 'Texas'],
};

const multipleColumns = [
  { values: Object.keys(states) },
  { values: states.Group1 },
];
</script>

<template>
  <Variant name="Basic">
    <Picker
      title="Title"
      :columns="states.Group1"
      style="min-width: 350px"
      confirm-button-text="Confirm"
      cancel-button-text="Cancel"
    />
  </Variant>

  <Variant name="Multiple Columns">
    <Picker
      title="Title"
      style="min-width: 350px"
      confirm-button-text="Confirm"
      cancel-button-text="Cancel"
      :columns="multipleColumns"
    />
  </Variant>

  <Variant name="Loading">
    <Picker
      title="Title"
      style="min-width: 350px"
      confirm-button-text="Confirm"
      cancel-button-text="Cancel"
      loading
    />
  </Variant>
</template>
