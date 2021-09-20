import type { MarkdownData } from '@vitebook/plugin-markdown/shared';
import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePage } from './usePage';

export type MarkdownDataRef = ComputedRef<Readonly<MarkdownData> | undefined>;

export function useMarkdownData(): Readonly<MarkdownDataRef> {
  const page = usePage();
  return computed(() =>
    isVueMarkdownPage(page.value) ? shallowReadonly(page.value.data) : undefined
  );
}
