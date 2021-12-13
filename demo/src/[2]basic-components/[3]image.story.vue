<script setup>
import { Variant } from '@vitebook/vue';
import { Image } from 'vant';
</script>

<template>
  <Variant name="Basic">
    <Image width="300" height="300" src="https://img.yzcdn.cn/vant/cat.jpeg" />
  </Variant>

  <Variant name="Lazy">
    <div class="lazy-container">
      <Image
        width="300"
        height="300"
        src="https://img.yzcdn.cn/vant/cat.jpeg"
        :lazy-load="true"
      />
    </div>
  </Variant>

  <Variant name="Placeholder">
    <Image width="300" height="300" show-loading />
  </Variant>
</template>

<style>
.lazy-container {
  margin-top: 120vh;
  padding-bottom: 40vh;
}
</style>
