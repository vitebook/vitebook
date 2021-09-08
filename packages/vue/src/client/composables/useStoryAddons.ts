import addons from '@virtual/vitebook/plugin-story/addons';
import { Ref, ref, shallowReadonly } from 'vue';

import type { VueVirtualStoryAddonsModule } from '../types/addon';

export type StoryAddonsRef = Ref<
  Readonly<VueVirtualStoryAddonsModule['default']>
>;

const storyAddonsRef: StoryAddonsRef = ref(shallowReadonly(addons));

export function useStoryAddons(): Readonly<StoryAddonsRef> {
  return shallowReadonly(storyAddonsRef);
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/@virtual/vitebook/plugin-story/addons',
    (mod: VueVirtualStoryAddonsModule) => {
      storyAddonsRef.value = shallowReadonly(mod.default);
    }
  );
}
