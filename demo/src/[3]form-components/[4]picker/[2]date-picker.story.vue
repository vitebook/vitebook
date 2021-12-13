<script setup>
import { Variant } from '@vitebook/vue';
import { DatetimePicker } from 'vant';
import { ref } from 'vue';

const currentDate = ref(new Date(2021, 0, 17));
const minDate = new Date(2020, 0, 1);
const maxDate = new Date(2025, 10, 1);
</script>

<template>
  <DatetimePicker
    v-model="currentDate"
    type="date"
    title="Choose Date"
    :min-date="minDate"
    :max-date="maxDate"
    style="min-width: 350px"
    confirm-button-text="Confirm"
    cancel-button-text="Cancel"
  />
</template>
