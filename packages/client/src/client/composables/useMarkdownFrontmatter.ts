import type { MarkdownFrontmatter } from '@vitebook/plugin-markdown/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownFrontmatterRef = ComputedRef<
  Readonly<MarkdownFrontmatter> | undefined
>;

export function useMarkdownFrontmatter(): MarkdownFrontmatterRef {
  const page = usePage();
  return computed(() =>
    isVueMarkdownPage(page.value)
      ? shallowReadonly(page.value.data.frontmatter)
      : undefined
  );
}
