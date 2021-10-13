import {
  usePage,
  usePages,
  useRouteLocale,
  useSiteOptions,
  withBaseUrl
} from '@vitebook/client';
import {
  ensureLeadingSlash,
  isArray,
  isUndefined,
  removeEndingSlash,
  resolveLocalePath,
  toTitleCase
} from '@vitebook/core/shared';
import { computed, ComputedRef, Ref, ref, shallowReadonly } from 'vue';
import { useRouter } from 'vue-router';

import {
  isSidebarGroup,
  MultiSidebarItemsConfig,
  SidebarItem,
  SidebarItemGroup,
  SidebarItemLink,
  SidebarItemsConfig
} from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

const isSidebarOpen = ref(false);

export function useIsSidebarOpen(): Ref<boolean> {
  return isSidebarOpen;
}

export function isSidebarItemsConfig(
  config: SidebarItemsConfig | MultiSidebarItemsConfig
): config is SidebarItemsConfig {
  return config === false || config === 'auto' || isArray(config);
}

export function useSidebarItemsConfig(): ComputedRef<
  Readonly<SidebarItemsConfig>
> {
  const router = useRouter();
  const theme = useLocalizedThemeConfig();

  return computed(() => {
    const config = theme.value.sidebar?.items ?? 'auto';

    if (isSidebarItemsConfig(config)) {
      return config;
    }

    const route = removeEndingSlash(
      ensureLeadingSlash(router.currentRoute.value.path)
    );

    for (const path in config) {
      if (
        route.startsWith(
          withBaseUrl(removeEndingSlash(ensureLeadingSlash(path)))
        )
      ) {
        return config[path];
      }
    }

    return 'auto';
  });
}

export function useSidebarItems(): ComputedRef<Readonly<SidebarItem[]>> {
  const sidebarConfig = useSidebarItemsConfig();
  const autoSidebarItems = useAutoSidebarItems();

  return computed(() => {
    const config = sidebarConfig.value;

    if (config === false) {
      return [];
    }

    if (config === 'auto') {
      return autoSidebarItems.value;
    }

    return config;
  });
}

function useAutoSidebarItems(): ComputedRef<Readonly<SidebarItem[]>> {
  const page = usePage();
  const pages = usePages();
  const site = useSiteOptions();
  const routeLocale = useRouteLocale();

  return computed(() => {
    if (isUndefined(page.value)) {
      return [];
    }

    const sidebarItems: SidebarItem[] = [];

    let items = sidebarItems;

    for (const page of pages.value) {
      let path = decodeURI(page.route).split('/').slice(1);

      if (path[0] === '' && path.length === 1) continue;

      if (path[path.length - 1] === '') {
        path = path.slice(0, -1);
      }

      const pageLocale = resolveLocalePath(
        site.value.baseUrl,
        site.value.locales,
        page.route
      );

      if (routeLocale.value !== pageLocale) {
        continue;
      }

      path.forEach((segment, i) => {
        if (i === 0 && ensureLeadingSlash(segment) === routeLocale.value) {
          return;
        }

        const title = toTitleCase(segment.replace('.html', ''));

        if (i === path.length - 1) {
          items.push({
            text: title,
            type: page.type,
            link: withBaseUrl(page.route)
          });

          return;
        }

        let group: SidebarItemGroup | undefined = items
          .filter(isSidebarGroup)
          .find((group) => group.text === title);

        if (!group) {
          group = {
            text: title,
            collapsible: true,
            children: []
          };

          items.push(group);
        }

        items = group!.children;
      });

      items = sidebarItems;
    }

    return shallowReadonly(sidebarItems);
  });
}

export function useHasSidebarItems(): ComputedRef<boolean> {
  const items = useSidebarItems();
  return computed(() => items.value.length > 0);
}

export function flattenSidebarLinks(items: SidebarItem[]): SidebarItemLink[] {
  return items.reduce<SidebarItemLink[]>((links, item) => {
    if (!isSidebarGroup(item)) {
      links.push({ text: item.text, link: item.link });
    } else {
      links = [...links, ...flattenSidebarLinks(item.children)];
    }

    return links;
  }, []);
}
