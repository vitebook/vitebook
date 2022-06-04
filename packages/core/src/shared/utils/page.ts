import type { LoadedClientMarkdownPage, LoadedClientPage } from '../Page';
import { isNumber } from './unit';
import { noslash, slash } from './url';

const STRIP_PAGE_ORDER_RE = /\/\[(\d*)\]/g;
export function stripPageOrderFromPath(filePath: string) {
  return filePath.replace(STRIP_PAGE_ORDER_RE, '/');
}

function calcPageOrderScore(filePath: string): number {
  let score = 1;

  for (const matches of filePath.matchAll(STRIP_PAGE_ORDER_RE) ?? []) {
    score *= Number(matches[1]);
  }

  return score;
}

export function sortOrderedPageFiles(files: string[]): string[] {
  return files
    .map(slash)
    .sort(
      (fileA, fileB) => calcPageOrderScore(fileA) - calcPageOrderScore(fileB),
    )
    .map(stripPageOrderFromPath);
}

export function isLoadedPage(page: unknown): page is LoadedClientPage {
  // @ts-expect-error - .
  return typeof page === 'object' && '$$loaded' in page;
}

export function isLoadedMarkdownPage(
  page: unknown,
): page is LoadedClientMarkdownPage {
  return isLoadedPage(page) && page.ext === '.md';
}

const splitRE = /\//g;
const htmlExtRE = /(?:index)?\.html$/;

export const DATA_ASSET_BASE_URL = '/assets/data';

export function buildDataAssetID(pathname: string, layoutIndex?: number) {
  const id = `${isNumber(layoutIndex) ? `$${layoutIndex}:` : ''}${pathname
    .replace(splitRE, '_')
    .replace(htmlExtRE, '')}`;

  return id;
}

const layoutIndexRE = /^\/?\$\d+/;

export function parseDataAssetURL(url: URL): {
  url: URL;
  layoutIndex: number;
} {
  const pathname = noslash(
    decodeURI(url.pathname).replace(DATA_ASSET_BASE_URL, ''),
  );

  const [layoutIndex, route] = layoutIndexRE.test(pathname)
    ? pathname.slice(1).split(':') //slice $ off
    : [-1, pathname];

  let routePath = route.replace(/_/g, '/').replace(/\.json$/, '');
  if (!routePath.endsWith('/')) routePath += '.html';

  return {
    url: new URL(routePath, url.href),
    layoutIndex: Number(layoutIndex),
  };
}
