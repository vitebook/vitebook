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
    const routePath = `/${decodeURI(route.path.replace('.html', ''))}`;

    let active = false;

    if (item.value.activeMatch) {
      active = new RegExp(item.value.activeMatch).test(routePath);
    } else {
      const itemPath = withBaseUrl(item.value.link.replace('.html', ''));
      active =
        itemPath === '/'
          ? itemPath === routePath
          : routePath.startsWith(itemPath);
    }

    return {
      class: {
        active,
        isExternal
      },
      href: isExternal ? item.value.link : withBaseUrl(item.value.link),
      target: item.value.target || (isExternal ? `_blank` : null),
      rel: item.value.rel || (isExternal ? `noopener noreferrer` : null),
      'aria-label': item.value.ariaLabel
    };
  });

  return {
    props,
    isExternal
  };
}
