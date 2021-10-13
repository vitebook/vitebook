import type { Page } from '@vitebook/core/shared';

import type { LoadedSvelteMarkdownPage } from '../types/SvelteMarkdownPage';

export function isLoadedSvelteMarkdownPage(
  page?: Page
): page is LoadedSvelteMarkdownPage {
  return (
    page?.type === 'svelte:md' && !!(page as LoadedSvelteMarkdownPage).module
  );
}
