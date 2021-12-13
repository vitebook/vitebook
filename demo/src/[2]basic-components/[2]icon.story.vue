<script setup>
import { Variant } from '@vitebook/vue';
import { Icon } from 'vant';
</script>

<template>
  <Variant name="Basic">
    <div class="icon-group">
      <Icon name="chat-o" size="3rem" />
      <Icon name="shopping-cart" size="3rem" />
      <Icon name="fire" size="3rem" />
    </div>
  </Variant>

  <Variant name="With Badge">
    <div class="icon-group">
      <Icon name="chat-o" size="3rem" badge="24" />
      <Icon name="shopping-cart" size="3rem" badge="48" />
    </div>
  </Variant>
</template>

<style>
.icon-group {
  display: flex;
  align-items: center;
}

.icon-group > * {
  margin-left: 24px;
}

.icon-group > *:first-child {
  margin-left: 0;
}
</style>
