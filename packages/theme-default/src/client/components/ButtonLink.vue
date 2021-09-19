<script setup="props" lang="ts">
import { withBaseUrl } from '@vitebook/client';
import { useRouter } from 'vue-router';

interface Props {
  href: string;
  type?: 'primary' | 'secondary';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary'
});

const withBase = withBaseUrl;

const router = useRouter();

function onClick(event: Event) {
  if (props.href === '_back') {
    event.preventDefault();
    router.back();
  }
}
</script>

<template>
  <router-link
    class="link"
    :class="{ secondary: type === 'secondary' }"
    :to="href === '_back' ? '' : withBase(href)"
    @click.prevent
    @pointerdown="onClick"
    @keydown.enter="onClick"
  >
    <slot />
  </router-link>
</template>

<style scoped>
.link {
  display: inline-block;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.125rem;
  color: var(--color-black);
  background-color: var(--color-primary);
  text-decoration: none;
  border: 0.12rem solid var(--color-black);
  transition: transform 150ms ease;
}

html.dark .link:not(.secondary) {
  border: 0.12rem solid var(--color-primary);
}

.link.secondary {
  background-color: transparent;
  color: var(--color-text);
  border: 0.12rem solid var(--color-text);
}

@media (hover: hover) {
  .link:hover {
    background-color: #fbbd00;
    transform: scale(1.02);
  }

  .link.secondary:hover {
    background-color: var(--color-gray-100);
  }

  html.dark .link.secondary:hover {
    background-color: var(--color-gray-400);
  }
}

@media (min-width: 420px) {
  .link {
    padding: 1rem 2rem;
  }
}

@media (min-width: 576px) {
  .link {
    font-size: 1.1rem;
    padding: 1rem 2.2rem;
  }
}
</style>
