import type { Page } from '@vitebook/core/shared';

import type {
  LoadedSvelteMarkdownPage,
  SvelteMarkdownPage
} from './SvelteMarkdownPage';

export function isSvelteMarkdownPage(page?: Page): page is SvelteMarkdownPage {
  return page?.type === 'svelte:md';
}

export function isLoadedSvelteMarkdownPage(
  page?: Page
): page is LoadedSvelteMarkdownPage {
  return (
    page?.type === 'svelte:md' && !!(page as LoadedSvelteMarkdownPage).module
  );
}
