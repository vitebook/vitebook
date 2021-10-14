import { useMediaQuery } from '@vueuse/core';
import {
  computed,
  ComputedRef,
  onMounted,
  Ref,
  ref,
  shallowReadonly,
  watch
} from 'vue';
import { useRouter } from 'vue-router';

import type { DefaultThemeNavbarLocaleConfig } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useNavbarConfig(): ComputedRef<
  DefaultThemeNavbarLocaleConfig | undefined
> {
  const theme = useLocalizedThemeConfig();
  return computed(() =>
    theme.value.navbar !== false ? theme.value.navbar : undefined
  );
}

export function useHasNavbarItems(): ComputedRef<boolean> {
  const config = useNavbarConfig();
  return computed(() => (config.value?.items?.length ?? 0) > 0);
}

export function useNavbarHeight(): Readonly<Ref<number>> {
  const router = useRouter();
  const isLargeScreen = useMediaQuery('(min-width: 992px)');

  const height = ref(0);

  onMounted(() => {
    watch(
      () => [isLargeScreen, router.currentRoute],
      () => {
        height.value =
          parseFloat(
            window
              .getComputedStyle(document.body)
              .getPropertyValue('--vbk--navbar-height')
          ) * 16;
      },
      { immediate: true }
    );
  });

  return shallowReadonly(height);
}
