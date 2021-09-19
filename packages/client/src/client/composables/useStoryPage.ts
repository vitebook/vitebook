import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { LoadedVueStoryPage } from '../types/page';
import { usePage } from './usePage';

export type StoryPageRef = ComputedRef<
  Readonly<LoadedVueStoryPage> | undefined
>;

const page = usePage();

const storyPageRef: StoryPageRef = computed(() =>
  isStoryPage(page.value) ? shallowReadonly(page.value) : undefined
);

export function useStoryPage(): Readonly<StoryPageRef> {
  return shallowReadonly(storyPageRef);
}
