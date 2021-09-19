import type { MarkdownFrontmatter } from '@vitebook/plugin-markdown/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownFrontmatterRef = ComputedRef<
  Readonly<MarkdownFrontmatter> | undefined
>;

const page = usePage();

const markdownFrontmatterRef: MarkdownFrontmatterRef = computed(() =>
  isVueMarkdownPage(page.value)
    ? shallowReadonly(page.value.data.frontmatter)
    : undefined
);

export function useMarkdownFrontmatter(): Readonly<MarkdownFrontmatterRef> {
  return shallowReadonly(markdownFrontmatterRef);
}
