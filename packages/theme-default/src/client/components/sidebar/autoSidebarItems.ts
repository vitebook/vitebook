import {
  currentPage,
  currentRouteLocale,
  ensureLeadingSlash,
  isUndefined,
  localizedSiteOptions,
  pages,
  removeLeadingSlash,
  resolveLocalePath,
  toTitleCase,
  withBaseUrl,
} from '@vitebook/client';
import { derived } from 'svelte/store';

import { isSidebarMenu, SidebarItem, SidebarMenu } from '../../../shared';

export const autoSidebarItems = derived(
  [currentPage, pages, localizedSiteOptions, currentRouteLocale],
  ([page, pages, site, routeLocale]) => {
    if (isUndefined(page)) {
      return [];
    }

    const sidebarItems: SidebarItem[] = [];

    let items = sidebarItems;

    const toPath = (page) =>
      decodeURI(`<root>/${removeLeadingSlash(page.route)}`)
        .replace(/\[.*?\]/g, '')
        .split('.')[0]
        .split('/')
        .slice(1);

    const getDir = (page) =>
      decodeURI(`<root>/${removeLeadingSlash(page.route)}`)
        .replace(/\[.*?\]/g, '')
        .split('/')
        .slice(0, -1)
        .join('/');

    for (const page of pages) {
      let path = toPath(page);

      if (path[0] === '' && path.length === 1) continue;

      if (path[path.length - 1] === '') {
        path = path.slice(0, -1);
      }

      const pageLocale = resolveLocalePath(
        site.baseUrl,
        site.locales,
        page.route,
      );

      if (routeLocale !== pageLocale) {
        continue;
      }

      path.forEach((segment, i) => {
        if (i === 0 && ensureLeadingSlash(segment) === routeLocale) {
          return;
        }

        const matchesDirNameAndSoloFile =
          i === path.length - 2 &&
          path[i] === path[i + 1] &&
          !pages.some((p) => p !== page && getDir(p) === getDir(page));

        if (matchesDirNameAndSoloFile) return;

        const title = toTitleCase(segment);

        if (i === path.length - 1) {
          items.push({
            text: title,
            type: page.type,
            link: withBaseUrl(page.route),
          });
          return;
        }

        let group: SidebarMenu | undefined = items
          .filter(isSidebarMenu)
          .find((group) => group.text === title);

        if (!group) {
          group = {
            text: title,
            collapsible: true,
            children: [],
          };

          items.push(group);
        }

        items = group.children;
      });

      items = sidebarItems;
    }

    return sidebarItems;
  },
);
