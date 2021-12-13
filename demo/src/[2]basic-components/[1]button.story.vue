<script setup>
import { Variant } from '@vitebook/vue';
import { Button } from 'vant';
</script>

<template>
  <Variant name="Type">
    <div class="btn-group">
      <Button type="primary">Primary</Button>
      <Button type="success">Success</Button>
      <Button type="default">Default</Button>
      <Button type="danger">Danger</Button>
      <Button type="warning">Warning</Button>
    </div>
  </Variant>

  <Variant name="Plain">
    <div class="btn-group">
      <Button plain type="primary">Primary</Button>
      <Button plain type="danger">Danger</Button>
    </div>
  </Variant>

  <Variant name="Disabled">
    <div class="btn-group">
      <Button disabled type="primary">Primary</Button>
      <Button disabled type="success">Success</Button>
    </div>
  </Variant>

  <Variant name="Loading">
    <div class="btn-group">
      <Button loading type="primary" />
      <Button loading type="primary" loading-type="spinner" />
      <Button loading type="primary" loading-text="Loading..." />
    </div>
  </Variant>
</template>

<style>
.btn-group {
  display: flex;
  align-items: center;
}

.btn-group > button {
  margin-left: 8px;
}

.btn-group > button:first-child {
  margin-left: 0;
}
</style>
