<script setup="props" lang="ts">
import { useMarkdownPageMeta, usePage } from '@vitebook/client';
import type { MarkdownHeader } from '@vitebook/plugin-markdown/shared';
import {
  computed,
  defineComponent,
  h,
  markRaw,
  resolveComponent,
  VNode
} from 'vue';
import { useRouter } from 'vue-router';

import { defaultThemeLocaleOptions } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import { useNavbarHeight } from '../Navbar/useNavbar';
import { useActiveHeaderLinks } from './useActiveHeaderLinks';

const page = usePage();
const pageMeta = useMarkdownPageMeta();
const router = useRouter();
const theme = useLocalizedThemeConfig();

const headers = computed(() => pageMeta.value?.headers ?? []);

const enabled = computed(
  () =>
    (pageMeta.value?.frontmatter.toc as boolean) ??
    theme.value.markdown?.toc ??
    defaultThemeLocaleOptions.markdown.toc
);

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
  <div
    v-if="enabled && page?.type.includes('md') && headers.length > 1"
    class="md-floating-toc"
  >
    <ul class="md-floating-toc__list">
      <Tree />
    </ul>
  </div>
</template>
