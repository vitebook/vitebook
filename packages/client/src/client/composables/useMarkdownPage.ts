import {
  isLoadedVueMarkdownPage,
  LoadedVueMarkdownPage
} from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownPageRef = ComputedRef<
  Readonly<LoadedVueMarkdownPage> | undefined
>;

export function useMarkdownPage(): MarkdownPageRef {
  const page = usePage();
  return computed(() =>
    isLoadedVueMarkdownPage(page.value)
      ? shallowReadonly(page.value)
      : undefined
  );
}
