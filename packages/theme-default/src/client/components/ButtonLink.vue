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
