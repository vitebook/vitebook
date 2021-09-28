import { usePage } from '@vitebook/client';
import { isArray } from '@vitebook/core/shared';
import { computed, ComputedRef } from 'vue';

import type { SidebarItemLink } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import { flattenSidebarLinks, useSidebarItems } from '../Sidebar/useSidebar';

export function useNextAndPrevLinks(): {
  next: ComputedRef<SidebarItemLink | null>;
  prev: ComputedRef<SidebarItemLink | null>;
  hasLinks: ComputedRef<boolean>;
} {
  const page = usePage();
  const theme = useLocalizedThemeConfig();

  const candidates = computed(() => {
    const config = useSidebarItems();
    return isArray(config.value) ? flattenSidebarLinks(config.value) : [];
  });

  const index = computed(() => {
    return candidates.value.findIndex((item) => {
      return item.link === page.value?.route;
    });
  });

  const next = computed(() => {
    if (
      theme.value.markdown?.nextLink !== false &&
      index.value > -1 &&
      index.value < candidates.value.length - 1
    ) {
      return candidates.value[index.value + 1];
    }

    return null;
  });

  const prev = computed(() => {
    if (theme.value.markdown?.prevLink !== false && index.value > 0) {
      return candidates.value[index.value - 1];
    }

    return null;
  });

  const hasLinks = computed(() => !!next.value || !!prev.value);

  return {
    next,
    prev,
    hasLinks
  };
}
