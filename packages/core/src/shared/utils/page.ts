import type { LoadedClientMarkdownPage, LoadedClientPage } from '../Page';
import { isNumber } from './unit';
import { noslash } from './url';

export function isLoadedPage(page: unknown): page is LoadedClientPage {
  // @ts-expect-error - .
  return typeof page === 'object' && '$$loaded' in page;
}

export function isLoadedMarkdownPage(
  page: unknown,
): page is LoadedClientMarkdownPage {
  return isLoadedPage(page) && page.rootPath.endsWith('.md');
}

const splitRE = /\//g;
const htmlExtRE = /\.html$/;

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

  return {
    url: new URL(route.replace(/_/g, '/').replace(/\.json$/, ''), url.href),
    layoutIndex: Number(layoutIndex),
  };
}
