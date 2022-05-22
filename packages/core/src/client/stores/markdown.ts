import { isLoadedMarkdownPage } from '../../shared';
import { page } from './page';
import { derived } from './store';

export const markdown = derived(page, ($page) =>
  isLoadedMarkdownPage($page) ? $page.meta : undefined,
);

export const frontmatter = derived(
  markdown,
  ($meta) => $meta?.frontmatter ?? {},
);
