import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVueMarkdownPage } from '../types/page';
import { usePage } from './usePage';

export type MarkdownPageRef = ComputedRef<
  Readonly<LoadedVueMarkdownPage> | undefined
>;

const page = usePage();

const markdownPageRef: MarkdownPageRef = computed(() =>
  isVueMarkdownPage(page.value) ? shallowReadonly(page.value) : undefined
);

export function useMarkdownPage(): Readonly<MarkdownPageRef> {
  return shallowReadonly(markdownPageRef);
}
