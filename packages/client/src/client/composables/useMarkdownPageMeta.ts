import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownPageMetaRef = ComputedRef<
  Readonly<MarkdownPageMeta> | undefined
>;

export function useMarkdownPageMeta(): Readonly<MarkdownPageMetaRef> {
  const page = usePage();
  return computed(() =>
    isVueMarkdownPage(page.value) ? shallowReadonly(page.value.meta) : undefined
  );
}
