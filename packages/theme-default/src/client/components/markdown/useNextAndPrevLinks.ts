import {
  currentMarkdownPageMeta,
  currentPage,
  isArray,
} from '@vitebook/client';
import { derived, Readable } from 'svelte/store';

import type { SidebarLink } from '../../../shared';
import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
import { flattenSidebarLinks } from '../sidebar/flattenSidebarLinks';
import { sidebarItems } from '../sidebar/sidebarItems';

const candidates = derived(sidebarItems, (items) =>
  isArray(items) ? flattenSidebarLinks(items) : [],
);

export function useNextAndPrevLinks(): Readable<{
  next: SidebarLink | null;
  prev: SidebarLink | null;
  hasLinks: boolean;
}> {
  return derived(
    [currentPage, currentMarkdownPageMeta, localizedThemeConfig, candidates],
    ([page, pageMeta, theme, candidates]) => {
      if (!page) {
        return {
          next: null,
          prev: null,
          hasLinks: false,
        };
      }

      const index = candidates.findIndex((item) => item.link === page.route);

      function nextLink() {
        if (
          theme.markdown?.nextLink !== false &&
          pageMeta?.frontmatter.nextLink !== false &&
          index > -1 &&
          index < candidates.length - 1
        ) {
          return candidates[index + 1];
        }

        return null;
      }

      function prevLink() {
        if (
          theme.markdown?.prevLink !== false &&
          pageMeta?.frontmatter.prevLink !== false &&
          index > 0
        ) {
          return candidates[index - 1];
        }
        return null;
      }

      const next = nextLink();
      const prev = prevLink();

      return {
        next,
        prev,
        hasLinks: !!next || !!prev,
      };
    },
  );
}
