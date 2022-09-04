import { isNumber } from './utils/unit';
import { noslash } from './utils/url';

const splitRE = /\//g;
const htmlExtRE = /(?:index)?\.html$/;

export const STATIC_DATA_ASSET_BASE_PATH = '/_immutable/data';

export function resolveStaticDataAssetID(
  pathname: string,
  layoutIndex?: number,
) {
  const id = `${isNumber(layoutIndex) ? `$${layoutIndex}:` : ''}${pathname
    .replace(splitRE, '_')
    .replace(htmlExtRE, '')}`;

  return id;
}

const layoutIndexRE = /^\/?\$\d+/;

export function parseStaticDataAssetURL(url: URL): {
  url: URL;
  layoutIndex: number;
} {
  const pathname = noslash(
    decodeURI(url.pathname).replace(STATIC_DATA_ASSET_BASE_PATH, ''),
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
