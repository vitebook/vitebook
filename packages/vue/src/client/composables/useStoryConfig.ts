import { isStoryPage } from '@vitebook/plugin-story/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import type { VueStoryConfig } from '../types/story';
import { usePage } from './usePage';

export type StoryConfigRef = ComputedRef<Readonly<VueStoryConfig> | undefined>;

const page = usePage();

const storyConfigRef: StoryConfigRef = computed(() =>
  isStoryPage(page.value) ? shallowReadonly(page.value.story ?? {}) : undefined
);

export function useStoryConfig(): Readonly<StoryConfigRef> {
  return shallowReadonly(storyConfigRef);
}
