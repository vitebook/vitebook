import {
  ensureLeadingSlash,
  isArray,
  isSidebarGroup,
  isUndefined,
  MultiSidebarItemsConfig,
  removeEndingSlash,
  resolveLocalePath,
  SidebarGroup,
  SidebarItem,
  SidebarItemsConfig,
  toTitleCase
} from '@vitebook/core/shared';
import {
  usePage,
  usePages,
  useRouteLocale,
  useSiteOptions,
  withBaseUrl
} from '@vitebook/vue/client';
import { computed, ComputedRef, Ref, ref, shallowReadonly } from 'vue';
import { useRouter } from 'vue-router';

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
  const themeConfig = useLocalizedThemeConfig();

  return computed(() => {
    const config = themeConfig.value.sidebar.items ?? 'auto';

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
  const routeLocale = useRouteLocale();
  const siteConfig = useSiteOptions();

  return computed(() => {
    if (isUndefined(page.value)) {
      return [];
    }

    const sidebarItems: SidebarItem[] = [];

    let items = sidebarItems;

    for (const page of pages.value) {
      let path = page.route.split('/').slice(1);

      if (path[0] === '' && path.length === 1) continue;

      if (path[path.length - 1] === '') {
        path = path.slice(0, -1);
      }

      const pageLocale = resolveLocalePath(
        siteConfig.value.baseUrl,
        siteConfig.value.locales,
        page.route
      );

      if (routeLocale.value !== pageLocale) {
        continue;
      }

      path.forEach((segment, i) => {
        const title = toTitleCase(segment.replace('.html', ''));

        if (i === path.length - 1) {
          items.push({
            text: title,
            link: withBaseUrl(page.route)
          });

          return;
        }

        let group: SidebarGroup | undefined = items
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

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
