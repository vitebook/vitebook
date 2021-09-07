import { defineComponent, h, onMounted } from 'vue';

import { usePrefetch } from './composables/usePrefetch.js';

export default defineComponent({
  name: 'App',
  setup() {
    // use site

    onMounted(() => {
      //
    });

    // In prod mode, we enable `IntersectionObserver` based pre-fetching.
    if (import.meta.env.PROD) usePrefetch();

    return () => h(Theme.Layout);
  }
});
