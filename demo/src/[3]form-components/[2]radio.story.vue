<script setup>
import { ref } from 'vue';
import { Variant } from '@vitebook/vue';
import { Radio, RadioGroup } from 'vant';

const checked = ref('1');
</script>

<template>
  <div style="--van-radio-label-color: var(--vbk--color-text)">
    <Variant name="Horizontal">
      <RadioGroup v-model="checked" direction="horizontal">
        <Radio name="1">Radio 1</Radio>
        <Radio name="2">Radio 2</Radio>
      </RadioGroup>
    </Variant>

    <Variant name="Vertical">
      <RadioGroup v-model="checked" direction="vertical">
        <Radio name="1">Radio 1</Radio>
        <Radio name="2" style="margin-top: 16px">Radio 2</Radio>
      </RadioGroup>
    </Variant>

    <Variant name="Disabled">
      <RadioGroup v-model="checked" disabled direction="horizontal">
        <Radio name="1">Radio 1</Radio>
        <Radio name="2">Radio 2</Radio>
      </RadioGroup>
    </Variant>
  </div>
</template>
