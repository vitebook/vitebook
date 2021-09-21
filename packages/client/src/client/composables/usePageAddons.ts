import { Ref, ref, shallowReadonly } from 'vue';

import addons from ':virtual/vitebook/addons';

import type { VirtualPageAddonsModule } from '../../shared';

export type PageAddonsRef = Ref<Readonly<VirtualPageAddonsModule['default']>>;

// Singleton.
const pageAddonsRef: PageAddonsRef = ref(shallowReadonly(addons));

export function usePageAddons(): Readonly<PageAddonsRef> {
  return shallowReadonly(pageAddonsRef);
}

if (import.meta.hot) {
  import.meta.hot.accept(
    '/:virtual/vitebook/addons',
    (mod: VirtualPageAddonsModule) => {
      pageAddonsRef.value = shallowReadonly(mod.default);
    }
  );
}
