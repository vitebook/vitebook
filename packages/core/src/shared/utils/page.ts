import type { LoadedClientMarkdownPage, LoadedClientPage } from '../Page';

export function isLoadedPage(page: unknown): page is LoadedClientPage {
  // @ts-expect-error - .
  return typeof page === 'object' && '$$loaded' in page;
}

export function isLoadedMarkdownPage(
  page: unknown,
): page is LoadedClientMarkdownPage {
  return isLoadedPage(page) && page.rootPath.endsWith('.md');
}
