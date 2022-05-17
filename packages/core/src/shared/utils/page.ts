import { LoadedClientMarkdownPage, LoadedClientPage } from '../types/Page';

export function isLoadedPage(page: unknown): page is LoadedClientPage {
  // @ts-expect-error - .
  return typeof page === 'object' && '$$page' in page;
}

export function isLoadedMarkdownPage(
  page: unknown,
): page is LoadedClientMarkdownPage {
  return isLoadedPage(page) && page.rootPath.endsWith('.md');
}
