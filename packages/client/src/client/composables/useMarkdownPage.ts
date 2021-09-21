import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVueMarkdownPage } from '../../shared/types/Page';
import { usePage } from './usePage';

export type MarkdownPageRef = ComputedRef<
  Readonly<LoadedVueMarkdownPage> | undefined
>;

export function useMarkdownPage(): MarkdownPageRef {
  const page = usePage();
  return computed(() =>
    isVueMarkdownPage(page.value) ? shallowReadonly(page.value) : undefined
  );
}
