<script setup lang="ts">
import { NavItemLink } from '@vitebook/core/shared';
import { toRefs } from 'vue';

import { useNavItemLink } from './useNavItemLink';

const props = defineProps<{
  item: NavItemLink;
}>();

const propsRef = toRefs(props);

const { props: linkProps, isExternal } = useNavItemLink(propsRef.item);

function handleLinkClick(event: Event, navigate: () => void): void {
  if (!isExternal) {
    event.preventDefault();
    navigate();
  }
}
</script>

<template>
  <div class="nav-link">
    <router-link v-slot="{ navigate, href }" :to="linkProps.to" custom>
      <a
        class="item"
        v-bind="linkProps"
        :to="undefined"
        :href="isExternal ? linkProps.to : href"
        @click="(e) => handleLinkClick(e, navigate)"
      >
        <span class="item-text">
          {{ item.text }} <OutboundLink v-if="isExternal" />
        </span>
      </a>
    </router-link>
  </div>
</template>

<style scoped>
.item {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  transition: transform 150ms ease-out;
}

.item:hover,
.item:focus {
  transform: scale(1.02);
}

.item:hover,
.item:focus,
.item.active {
  text-decoration: none;
}

.item:hover > .item-text,
.item:focus > .item-text,
.item.active > .item-text {
  border-bottom: 0.12rem solid var(--color-primary);
}
</style>
