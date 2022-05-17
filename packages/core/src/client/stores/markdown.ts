import { derived } from 'svelte/store';

import { isLoadedMarkdownPage } from '../../shared';
import { page } from './page';

export const markdown = derived(page, ($page) =>
  isLoadedMarkdownPage($page) ? $page.meta : undefined,
);

export const frontmatter = derived(
  markdown,
  ($meta) => $meta?.frontmatter ?? {},
);
