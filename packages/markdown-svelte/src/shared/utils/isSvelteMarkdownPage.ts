import type { Page } from '@vitebook/core';

import type { SvelteMarkdownPage } from '../types/SvelteMarkdownPage';

export function isSvelteMarkdownPage(page?: Page): page is SvelteMarkdownPage {
  return page?.type === 'svelte:md';
}
