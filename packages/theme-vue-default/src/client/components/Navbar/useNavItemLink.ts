import { isLinkExternal, NavItemLink } from '@vitebook/core/shared';
import { useLocalizedSiteOptions, withBaseUrl } from '@vitebook/vue/client';
import { computed, Ref } from 'vue';
import { useRoute } from 'vue-router';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useNavItemLink(item: Ref<NavItemLink>) {
  const route = useRoute();
  const siteConfig = useLocalizedSiteOptions();
  const isExternal = isLinkExternal(item.value.link, siteConfig.value.baseUrl);

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
