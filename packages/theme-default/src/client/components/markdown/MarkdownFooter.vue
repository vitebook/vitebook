<script setup lang="ts">
import { usePage } from '@vitebook/client';

import MarkdownEditPageLink from './MarkdownEditPageLink.vue';
import MarkdownLastUpdated from './MarkdownLastUpdated.vue';
import MarkdownNextAndPrevLinks from './MarkdownNextAndPrevLinks.vue';

const page = usePage();
</script>

<template>
  <div v-if="page?.type.includes('md')" class="md-footer">
    <MarkdownNextAndPrevLinks />
    <MarkdownEditPageLink />
    <MarkdownLastUpdated />
  </div>
</template>
