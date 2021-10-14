<script setup lang="ts">
import MarkdownEditPageLink from './MarkdownEditPageLink.vue';
import MarkdownLastUpdated from './MarkdownLastUpdated.vue';
import MarkdownNextAndPrevLinks from './MarkdownNextAndPrevLinks.vue';
</script>

<template>
  <div class="md-footer">
    <MarkdownNextAndPrevLinks />
    <MarkdownEditPageLink />
    <MarkdownLastUpdated />
  </div>
</template>

<style>
.md-footer {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 3.5rem;
}
</style>
