import { useLocalizedSiteOptions, withBaseUrl } from '@vitebook/client';
import { isLinkExternal } from '@vitebook/core/shared';
import { computed, Ref } from 'vue';
import { useRoute } from 'vue-router';

import type { NavItemLink, SidebarItemLink } from '../../../shared';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useNavItemLink(item: Ref<NavItemLink | SidebarItemLink>) {
  const route = useRoute();
  const site = useLocalizedSiteOptions();
  const isExternal = isLinkExternal(item.value.link, site.value.baseUrl);

  const props = computed(() => {
    const routePath = decodeURI(route.path);

    let active = item.value.link === routePath;

    if (item.value.activeMatch) {
      active = new RegExp(item.value.activeMatch).test(routePath);
    } else {
      const itemPath = withBaseUrl(item.value.link);
      active =
        itemPath === '/'
          ? itemPath === routePath
          : routePath.startsWith(itemPath);
    }

    return {
      class: { link: true, active, isExternal },
      to: !isExternal ? withBaseUrl(item.value.link) : item.value.link,
      target: item.value.target ?? (isExternal ? `_blank` : undefined),
      rel: item.value.rel ?? (isExternal ? `noopener noreferrer` : undefined),
      'aria-label': item.value.ariaLabel
    };
  });

  return {
    props,
    isExternal
  };
}
