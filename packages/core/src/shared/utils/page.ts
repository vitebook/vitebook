import type {
  ClientPageModule,
  LoadedClientMarkdownPage,
  LoadedClientPage,
} from '../Page';

export function isLoadedPage<Module extends ClientPageModule>(
  page: unknown,
): page is LoadedClientPage<Module> {
  // @ts-expect-error - .
  return typeof page === 'object' && '$$loaded' in page;
}

export function isLoadedMarkdownPage<Module extends ClientPageModule>(
  page: unknown,
): page is LoadedClientMarkdownPage<Module> {
  return isLoadedPage(page) && page.rootPath.endsWith('.md');
}
