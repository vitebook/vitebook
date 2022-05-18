import { isLoadedMarkdownPage } from '@vitebook/core';
import { derived } from 'svelte/store';

import { type ClientPageModule } from '../../shared';
import { page } from './page';

export const markdown = derived(page, ($page) =>
  isLoadedMarkdownPage<ClientPageModule>($page) ? $page.meta : undefined,
);

export const frontmatter = derived(
  markdown,
  ($meta) => $meta?.frontmatter ?? {},
);
