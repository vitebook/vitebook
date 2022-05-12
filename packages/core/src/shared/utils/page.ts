import { LoadedMarkdownPage, LoadedPage, Page } from '../types/Page';

export function isLoadedPage(page: Page): page is LoadedPage {
  return 'module' in page;
}

export function isLoadedMarkdownPage(
  page: Page | LoadedPage,
): page is LoadedMarkdownPage {
  return isLoadedPage(page) && page.type === 'md';
}
