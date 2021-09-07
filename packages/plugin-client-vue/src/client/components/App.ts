import { defineComponent, h, onMounted, watch } from 'vue';

import { usePrefetch } from '../composables/usePrefetch';
import { useSiteOptions } from '../composables/useSiteOptions';
import { useTheme } from '../composables/useTheme';

export default defineComponent({
  name: 'App',
  setup() {
    const theme = useTheme();
    const siteOptions = useSiteOptions();

    onMounted(() => {
      watch(
        () => siteOptions.value.lang,
        (lang: string) => {
          document.documentElement.lang = lang;
        },
        { immediate: true }
      );
    });

    // In prod mode, we enable `IntersectionObserver` based pre-fetching.
    if (import.meta.env.PROD) usePrefetch();

    return () => h(theme.value.Layout);
  }
});
