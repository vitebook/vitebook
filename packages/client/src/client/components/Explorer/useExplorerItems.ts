import { toTitleCase } from '@vitebook/core/shared';
import { computed, ComputedRef, shallowReadonly } from 'vue';

import { usePages } from '../../composables/usePages';
import { withBaseUrl } from '../../helpers/withBaseUrl';

export type ExplorerItem = ExplorerItemLink | ExplorerItemGroup;

export type ExplorerItemLink = {
  text: string;
  link: string;
  type?: string;
};

export type ExplorerItemGroup = {
  text: string;
  children: ExplorerItem[];
};

export function isExplorerGroup(item: ExplorerItem): item is ExplorerItemGroup {
  return Object.hasOwnProperty.call(item, 'children');
}

export function useExplorerItems(): ComputedRef<Readonly<ExplorerItem[]>> {
  const pages = usePages();

  return computed(() => {
    const ExplorerItems: ExplorerItem[] = [];

    let items = ExplorerItems;

    for (const page of pages.value) {
      let path = page.route.split('/').slice(1);

      if (path[0] === '' && path.length === 1) continue;

      if (path[path.length - 1] === '') {
        path = path.slice(0, -1);
      }

      path.forEach((segment, i) => {
        const title = toTitleCase(segment.replace('.html', ''));

        if (i === path.length - 1) {
          items.push({
            text: title,
            type: page.type,
            link: withBaseUrl(page.route)
          });

          return;
        }

        let group: ExplorerItemGroup | undefined = items
          .filter(isExplorerGroup)
          .find((group) => group.text === title);

        if (!group) {
          group = {
            text: title,
            children: []
          };

          items.push(group);
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        items = group!.children;
      });

      items = ExplorerItems;
    }

    return shallowReadonly(ExplorerItems);
  });
}
