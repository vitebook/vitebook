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

const separatorRE = /\//g;
const htmlExtRE = /\.html$/;
export const DATA_ASSET_URL_BASE = '/assets/data/';
export function buildDataAssetUrl(fileRootPath: string, urlPath: string) {
  const asset = `${fileRootPath.replace(separatorRE, '_')}/${urlPath
    .replace(separatorRE, '_')
    .replace(htmlExtRE, '')}.json`;

  return `${DATA_ASSET_URL_BASE}${asset}`;
}
