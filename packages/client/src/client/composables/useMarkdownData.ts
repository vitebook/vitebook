import type { MarkdownData } from '@vitebook/plugin-markdown/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownDataRef = ComputedRef<Readonly<MarkdownData> | undefined>;

const page = usePage();

const markdownDataRef: MarkdownDataRef = computed(() =>
  isVueMarkdownPage(page.value) ? shallowReadonly(page.value.data) : undefined
);

export function useMarkdownData(): Readonly<MarkdownDataRef> {
  return shallowReadonly(markdownDataRef);
}
