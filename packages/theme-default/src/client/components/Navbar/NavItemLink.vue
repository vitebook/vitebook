<script setup lang="ts">
import { NavItemLink } from '@vitebook/core/shared';
import { toRefs } from 'vue';

import { useNavItemLink } from './useNavItemLink';

const props = defineProps<{
  item: NavItemLink;
}>();

const propsRef = toRefs(props);

const { props: linkProps, isExternal } = useNavItemLink(propsRef.item);

function preventClick(event: Event) {
  if (!isExternal) {
    event.preventDefault();
  }
}

function handleLinkClick(event: Event, navigate: () => void): void {
  if (!isExternal) {
    event.preventDefault();
    navigate();
  }
}
</script>

<template>
  <router-link v-slot="{ navigate, href }" :to="linkProps.to" custom>
    <a
      v-bind="linkProps"
      :to="undefined"
      :href="isExternal ? linkProps.to : href"
      @click="preventClick"
      @pointerdown="(e) => handleLinkClick(e, navigate)"
      @keydown.enter="(e) => handleLinkClick(e, navigate)"
    >
      <span>{{ item.text }} <OutboundLink v-if="isExternal" /></span>
    </a>
  </router-link>
</template>
