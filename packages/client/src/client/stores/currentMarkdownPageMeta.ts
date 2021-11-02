import { derived } from 'svelte/store';

import { isLoadedMarkdownPage } from '../../shared';
import { currentPage } from './currentPage';

export const currentMarkdownPageMeta = derived(currentPage, (page) =>
  isLoadedMarkdownPage(page) ? page.meta : undefined,
);
