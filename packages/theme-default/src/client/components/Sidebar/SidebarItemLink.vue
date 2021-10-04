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
  computed(() => `/:virtual/vitebook/icons/sidebar-file-${type.value}?raw&vue`)
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

<style>
/**-------------------------------------------------------------------------------------------
* Icons
*-------------------------------------------------------------------------------------------*/

.sidebar-item.active svg {
  transition: var(--vbk--color-transition);
}

.sidebar.icon-colors .sidebar-item.type-md svg,
.sidebar.icon-colors .sidebar-item.type-vue\:md svg,
.sidebar-item.active.type-md svg,
.sidebar-item.active.type-vue\:md svg {
  color: var(--vbk--color-blue);
}

.sidebar.icon-colors .sidebar-item.type-vue svg,
.sidebar-item.active.type-vue svg {
  color: var(--vbk--color-green);
}

.sidebar.icon-colors .sidebar-item.type-svelte svg,
.sidebar-item.active.type-svelte svg {
  color: var(--vbk--color-red);
}

.sidebar.icon-colors .sidebar-item.type-js svg,
.sidebar.icon-colors .sidebar-item.type-jsx svg,
.sidebar-item.active.type-js svg,
.sidebar-item.active.type-jsx svg {
  color: var(--vbk--color-yellow);
}

.sidebar.icon-colors .sidebar-item.type-ts svg,
.sidebar.icon-colors .sidebar-item.type-tsx svg,
.sidebar-item.active.type-ts svg,
.sidebar-item.active.type-tsx svg {
  color: var(--vbk--color-blue);
}

.sidebar.icon-colors .sidebar-item.type-html svg,
.sidebar-item.active.type-html svg {
  color: var(--vbk--color-red);
}

.sidebar.icon-colors .sidebar-item.type-svg svg,
.sidebar-item.active.type-svg svg {
  color: var(--vbk--color-orange);
}

.sidebar.icon-colors .sidebar-item.type-png svg,
.sidebar.icon-colors .sidebar-item.type-jpeg svg,
.sidebar-item.active.type-png svg,
.sidebar-item.active.type-jpeg svg {
  color: var(--vbk--color-indigo);
}

.sidebar.icon-colors .sidebar-item.type-mp4 svg,
.sidebar-item.active.type-mp4 svg {
  color: var(--vbk--color-red);
}

.sidebar-item > .sidebar-item__menu-button > svg {
  color: var(--vbk--color-primary);
}

html.dark .sidebar-item.active[class*='type'] svg,
html.dark .sidebar.icon-colors .sidebar-item[class*='type'] svg {
  filter: brightness(140%);
}
</style>
