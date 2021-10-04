import { computed, ComputedRef, shallowReadonly } from 'vue';

import { isLoadedMarkdownPage, LoadedMarkdownPage } from '../../shared';
import { usePage } from './usePage';

export type MarkdownPageRef = ComputedRef<
  Readonly<LoadedMarkdownPage> | undefined
>;

export function useMarkdownPage(): MarkdownPageRef {
  const page = usePage();
  return computed(() =>
    isLoadedMarkdownPage(page.value) ? shallowReadonly(page.value) : undefined
  );
}
