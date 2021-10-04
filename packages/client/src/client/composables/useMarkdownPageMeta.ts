import type { MarkdownPageMeta } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownPageMetaRef = ComputedRef<
  Readonly<MarkdownPageMeta> | undefined
>;

export function useMarkdownPageMeta(): Readonly<MarkdownPageMetaRef> {
  const page = usePage();
  return computed(() =>
    page.value?.type?.endsWith('md')
      ? shallowReadonly(page.value.meta as MarkdownPageMeta)
      : undefined
  );
}
