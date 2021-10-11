<script setup lang="ts">
import { computed, toRefs } from 'vue';

import type { SidebarItemLink } from '../../../shared';
import { useNavItemLink } from '../Navbar/useNavItemLink';

const props = defineProps<{
  item: SidebarItemLink;
  depth: number;
}>();

const propsRef = toRefs(props);
const type = computed(() => propsRef.item.value.type);

const { props: linkProps, isExternal } = useNavItemLink(propsRef.item);

const Icon = () => '';

// useDynamicAsyncComponent(
//   computed(() => `/:virtual/vitebook/icons/sidebar-file-${type.value}?raw&vue`)
// );

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

.sidebar.icon-colors .sidebar-item[class*='md'] svg,
.sidebar-item.active[class*='md'] svg {
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

.sidebar.icon-colors .sidebar-item[class~='type-js'] svg,
.sidebar.icon-colors .sidebar-item[class~='type-jsx'] svg,
.sidebar.icon-colors .sidebar-item[class*=':js'] svg,
.sidebar-item.active[class~='type-js'] svg,
.sidebar-item.active[class~='type-jsx'] svg,
.sidebar-item.active[class*=':js'] svg {
  color: var(--vbk--color-yellow);
}

.sidebar.icon-colors .sidebar-item[class~='type-ts'] svg,
.sidebar.icon-colors .sidebar-item[class~='type-tsx'] svg,
.sidebar.icon-colors .sidebar-item[class*=':ts'] svg,
.sidebar-item.active[class~='type-ts'] svg,
.sidebar-item.active[class~='type-tsx'] svg,
.sidebar-item.active[class*=':ts'] svg {
  color: var(--vbk--color-blue);
}

.sidebar.icon-colors .sidebar-item[class~='type-html'] svg,
.sidebar.icon-colors .sidebar-item[class*=':html'] svg,
.sidebar-item.active[class~='type-html'] svg,
.sidebar-item.active[class*=':html'] svg {
  color: var(--vbk--color-red);
}

.sidebar.icon-colors .sidebar-item[class~='type-svg'] svg,
.sidebar.icon-colors .sidebar-item[class*=':svg'] svg,
.sidebar-item.active[class~='type-svg'] svg,
.sidebar-item.active[class*=':svg'] svg {
  color: var(--vbk--color-orange);
}

.sidebar.icon-colors .sidebar-item[class~='type-png'] svg,
.sidebar.icon-colors .sidebar-item[class*=':png'] svg,
.sidebar-item.active[class~='type-png'] svg,
.sidebar-item.active[class*=':png'] svg {
  color: var(--vbk--color-indigo);
}

.sidebar.icon-colors .sidebar-item[class~='type-jpeg'] svg,
.sidebar.icon-colors .sidebar-item[class*=':jpeg'] svg,
.sidebar-item.active[class~='type-jpeg'] svg,
.sidebar-item.active[class*=':jpeg'] svg {
  color: var(--vbk--color-indigo);
}

.sidebar.icon-colors .sidebar-item[class~='type-mp4'] svg,
.sidebar.icon-colors .sidebar-item[class*=':mp4'] svg,
.sidebar-item.active[class~='type-mp4'] svg,
.sidebar-item.active[class*=':mp4'] svg {
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
