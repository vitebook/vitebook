<script setup="props" lang="ts">
import { MarkdownHeader, useMarkdownPageMeta } from '@vitebook/client';
import {
  computed,
  defineComponent,
  h,
  markRaw,
  resolveComponent,
  VNode
} from 'vue';
import { useRouter } from 'vue-router';

import { useNavbarHeight } from '../Navbar/useNavbar';
import { useActiveHeaderLinks } from './useActiveHeaderLinks';

const pageMeta = useMarkdownPageMeta();
const router = useRouter();
const headers = computed(() => pageMeta.value?.headers ?? []);

function createTree(item: MarkdownHeader): VNode {
  const hash = `#${item.slug}`;
  const currentHash = decodeURIComponent(router.currentRoute.value.hash);

  const link = h(
    // @ts-expect-error - ?
    resolveComponent('RouterLink'),
    {
      class: ['md-floating-toc__link', currentHash === hash && 'active'],
      to: hash,
      replace: true
    },
    { default: () => item.title }
  );

  const children =
    item.children.length > 0
      ? h(
          'ul',
          { class: 'md-floating-toc__list' },
          item.children.map(createTree)
        )
      : null;

  return h('li', { class: 'md-floating-toc__list-item' }, [link, children]);
}

const Tree = defineComponent({
  setup() {
    const navbarHeight = useNavbarHeight();
    const tree = computed(() => markRaw(headers.value.map(createTree)));

    useActiveHeaderLinks({
      headerLinkSelector: '.md-floating-toc__link',
      headerAnchorSelector: 'a.header-anchor',
      delay: 100,
      offset: computed(() => navbarHeight.value + 16)
    });

    return { tree };
  },
  render({ tree }) {
    return tree;
  }
});
</script>

<template>
  <teleport to="#layout-portal-root">
    <div class="md-floating-toc">
      <ul class="md-floating-toc__list">
        <Tree />
      </ul>
    </div>
  </teleport>
</template>

<style>
.md-floating-toc {
  position: sticky;
  top: 0;
  right: 0;
  max-width: 11rem;
  max-height: 100vh;
  overflow-y: auto;
  padding-top: calc(var(--vbk--navbar-height) + 2rem);
  padding-left: 0.5rem;
  padding-right: 1.25rem;
  display: none;
}

html.no-navbar .md-floating-toc {
  padding-top: 2rem;
}

.md-floating-toc__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.md-floating-toc__list-item {
  line-height: 1.08rem;
  padding: 0.375rem 0;
}

.md-floating-toc__list-item > ul {
  margin-top: 0.375rem;
  margin-left: 0.75rem;
}

.md-floating-toc__list-item > ul > li:last-child {
  padding-bottom: 0;
}

.md-floating-toc__link {
  line-height: unset;
  font-size: 0.875rem;
  cursor: pointer;
  color: rgba(var(--vbk--color-text-rgb), 0.56);
}

.md-floating-toc__link.active {
  color: var(--vbk--color-primary);
}

@media (min-width: 992px) {
  .md-floating-toc {
    display: block;
  }
}
</style>
