import { defineComponent, h, onMounted, watch } from 'vue';

import { usePrefetch } from '../composables/usePrefetch';
import { useSiteLang } from '../composables/useSiteLang';
import { useTheme } from '../composables/useTheme';
import { useUpdateHead } from '../composables/useUpdateHead';

export default defineComponent({
  name: 'App',
  setup() {
    const lang = useSiteLang();
    const theme = useTheme();

    onMounted(() => {
      watch(
        () => lang.value,
        (lang: string) => {
          document.documentElement.lang = lang;
        },
        { immediate: true }
      );
    });

    useUpdateHead();

    // In prod mode, we enable `IntersectionObserver` based pre-fetching.
    if (import.meta.env.PROD) usePrefetch();

    return () => h(theme.value.Layout);
  }
});
