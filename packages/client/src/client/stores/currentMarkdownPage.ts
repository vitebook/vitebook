import { derived } from 'svelte/store';

import { isLoadedMarkdownPage } from '../../shared';
import { currentPage } from './currentPage';

export const currentMarkdownPage = derived(currentPage, (page) =>
  isLoadedMarkdownPage(page) ? page : undefined,
);
