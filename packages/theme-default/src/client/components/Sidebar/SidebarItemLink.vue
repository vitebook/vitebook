<script setup lang="ts">
import { computed, defineAsyncComponent, toRefs } from 'vue';

import type { SidebarItemLink } from '../../../shared';
import { useNavItemLink } from '../Navbar/useNavItemLink';

const props = defineProps<{
  item: SidebarItemLink;
  depth: number;
}>();

const propsRef = toRefs(props);

const { props: linkProps, isExternal } = useNavItemLink(propsRef.item);

const Icon = computed(() => {
  const type = propsRef.item.value.type;
  return type
    ? defineAsyncComponent(
        () =>
          import(
            /* @vite-ignore */ `/@virtual/vitebook/icons/sidebar-file-${type}`
          )
      )
    : null;
});

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
  <li class="sidebar-item">
    <router-link v-slot="{ navigate, href }" :to="linkProps.to" custom>
      <a
        v-bind="linkProps"
        :to="undefined"
        :href="isExternal ? linkProps.to : href"
        @click="preventClick"
        @pointerdown="(e) => handleLinkClick(e, navigate)"
        @keydown.enter="(e) => handleLinkClick(e, navigate)"
      >
        <span class="link-text">
          <component :is="Icon" />
          {{ item.text }}
          <OutboundLink v-if="isExternal" />
        </span>
      </a>
    </router-link>
  </li>
</template>
