<script setup>
import { ref } from 'vue';
import { Variant } from '@vitebook/vue';
import { Field, CellGroup } from 'vant';

const value = ref('');
const value1 = ref('');
const value2 = ref('');
</script>

<template>
  <Variant name="Basic">
    <CellGroup inset>
      <Field v-model="value" label="Label" placeholder="Text" />
    </CellGroup>
  </Variant>

  <Variant name="Disabled">
    <CellGroup inset>
      <Field label="Text" model-value="Input Readonly" readonly />
      <Field label="Text" model-value="Input Disabled" disabled />
    </CellGroup>
  </Variant>

  <Variant name="With Icon">
    <CellGroup inset>
      <Field
        v-model="value1"
        label="Text"
        left-icon="smile-o"
        right-icon="warning-o"
        placeholder="Show Icon"
      />
      <Field
        v-model="value2"
        clearable
        label="Text"
        left-icon="music-o"
        placeholder="Show Clear Icon"
      />
    </CellGroup>
  </Variant>
</template>
