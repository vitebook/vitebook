import { toTitleCase } from '@vitebook/core';
import { derived } from 'svelte/store';

import { pages } from '../../stores/pages';
import { withBaseUrl } from '../../stores/withBaseUrl';

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

export const explorerItems = derived(pages, (pages) => {
  const explorerItems: ExplorerItem[] = [];

  let items = explorerItems;

  for (const page of pages) {
    let path = decodeURI(page.route).split('/').slice(1);

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
          link: withBaseUrl(page.route),
        });

        return;
      }

      let group: ExplorerItemGroup | undefined = items
        .filter(isExplorerGroup)
        .find((group) => group.text === title);

      if (!group) {
        group = {
          text: title,
          children: [],
        };

        items.push(group);
      }

      items = group!.children;
    });

    items = explorerItems;
  }

  return explorerItems;
});
