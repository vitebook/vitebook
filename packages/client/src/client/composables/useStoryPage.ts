import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVueStoryPage } from '../types/page';
import { usePage } from './usePage';

export type StoryPageRef = ComputedRef<
  Readonly<LoadedVueStoryPage> | undefined
>;

export function useStoryPage(): StoryPageRef {
  const page = usePage();
  return computed(() =>
    isStoryPage(page.value) ? shallowReadonly(page.value) : undefined
  );
}
