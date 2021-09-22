<script setup lang="ts">
import { computed, toRefs } from 'vue';

import type { SidebarItemLink } from '../../../shared';
import { useDynamicAsyncComponent } from '../../composables/useDynamicAsyncComponent';
import { useNavItemLink } from '../Navbar/useNavItemLink';

const props = defineProps<{
  item: SidebarItemLink;
  depth: number;
}>();

const propsRef = toRefs(props);
const type = computed(() => propsRef.item.value.type);

const { props: linkProps, isExternal } = useNavItemLink(propsRef.item);

const Icon = useDynamicAsyncComponent(
  computed(() => `/:virtual/vitebook/icons/sidebar-file-${type.value}`)
);

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
  <li>
    <router-link v-slot="{ navigate, href }" :to="linkProps.to" custom>
      <a
        v-bind="linkProps"
        :to="undefined"
        :href="isExternal ? linkProps.to : href"
        :class="{
          'sidebar-item': true,
          'sidebar-link': true,
          [`type-${item.type}`]: item.type
        }"
        @click="preventClick"
        @pointerdown="(e) => handleLinkClick(e, navigate)"
        @keydown.enter="(e) => handleLinkClick(e, navigate)"
      >
        <span class="sidebar-link__text">
          <keep-alive>
            <component :is="Icon" />
          </keep-alive>
          {{ item.text }}
          <OutboundLink v-if="isExternal" />
        </span>
      </a>
    </router-link>
  </li>
</template>
