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
    class="button"
    :class="{ secondary: type === 'secondary' }"
    :to="href === '_back' ? '' : withBase(href)"
    @click.prevent
    @pointerdown="onClick"
    @keydown.enter="onClick"
  >
    <slot />
  </router-link>
</template>

<style>
.button {
  display: inline-block;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.15rem;
  color: var(--vbk--color-white);
  background-color: var(--vbk--color-primary);
  box-shadow: var(--vbk--elevation-small);
  text-decoration: none;
  transition: transform 150ms ease, var(--vbk--color-transition),
    background-color var(--vbk--color-transition-duration)
      var(--vbk--color-transition-timing);
}

.button:not(.secondary) {
  padding: 1.14rem 1.5rem;
}

html.dark .button:not(.secondary) {
  color: var(--vbk--color-black);
  background-color: var(--vbk--color-primary);
}

.button.secondary {
  background-color: transparent;
  color: var(--vbk--color-text);
  border: 0.12rem solid var(--vbk--color-text);
}

@media (hover: hover) {
  .button:hover {
    backface-visibility: hidden;
    transform: scale(1.05) translateZ(0);
    text-decoration: none;
    box-shadow: var(--vbk--elevation-medium);
  }
}

@media (min-width: 420px) {
  .button {
    padding: 1rem 2rem;
  }

  .button:not(.secondary) {
    padding: 1.14rem 2rem;
  }
}

@media (min-width: 576px) {
  .button {
    font-size: 1.1rem;
    padding: 1rem 2.2rem;
  }

  .button:not(.secondary) {
    padding: 1.14rem 2.2rem;
  }
}
</style>
