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
        class="link"
        v-bind="linkProps"
        :to="undefined"
        :href="isExternal ? linkProps.to : href"
        @click.prevent
        @pointerdown="(e) => handleLinkClick(e, navigate)"
        @keydown.enter="(e) => handleLinkClick(e, navigate)"
      >
        <span class="link-text">
          {{ item.text }} <OutboundLink v-if="isExternal" />
        </span>
      </a>
    </router-link>
  </div>
</template>

<style scoped>
.link {
  display: block;
  padding: 0.68rem 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.12rem;
  color: var(--color-text);
  white-space: nowrap;
}

.link.active > .link-text {
  color: var(--color-primary);
}

.link.active {
  text-decoration: none;
}

.link:hover {
  text-decoration: none;
}

@media (hover: hover) and (pointer: fine) and (max-width: 991px) {
  .link:hover {
    background-color: var(--color-bg-100);
  }
}

@media (hover: hover) and (min-width: 992px) {
  .link:hover > .link-text {
    color: var(--color-text);
    border-bottom: 0.12rem solid var(--color-primary);
  }
}

@media (min-width: 992px) {
  .link {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0;
  }

  .link.active > .link-text {
    color: var(--color-text);
    border-bottom: 0.12rem solid var(--color-primary);
  }
}
</style>
