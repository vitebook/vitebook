import path from 'upath';

import {
  calcRoutePathScore,
  isFunction,
  isRoutePathDynamic,
  type PageRoute,
  type PageRouteMatcherConfig,
  slash,
} from '../../../../shared';

const ROUTE_MATCHERS_RE = /{(.*?)}/g;
const LAYOUT_NAME_RE = /(.*?)@layout/;
const PAGE_ORDER_RE = /^\[(\d*)\]/;
const STRIP_PAGE_ORDER_RE = /\/\[(\d*)\]/g;

export function getPageLayoutNameFromPath(filePath: string) {
  const filename = path
    .basename(filePath, path.extname(filePath))
    .replace(/\.reset($|\/)/, '');
  const match = filename.match(LAYOUT_NAME_RE)?.[1];
  return match && match.length > 0 ? match : filename;
}

export function stripPageOrderFromPath(filePath: string) {
  return filePath.replace(STRIP_PAGE_ORDER_RE, '/');
}

export function stripRouteMatchersFromPath(filePath: string) {
  return filePath.replace(ROUTE_MATCHERS_RE, '');
}

export function stripPageLayoutNameFromPath(filePath: string) {
  const ext = path.extname(filePath);
  return filePath.replace(new RegExp(`@\\w+\\.${ext.slice(1)}$`, 'i'), ext);
}

export function stripPageInfoFromPath(filePath: string) {
  return stripRouteMatchersFromPath(
    stripPageLayoutNameFromPath(stripPageOrderFromPath(filePath)),
  );
}

export function resolvePageRouteFromFilePath(
  pagesDir: string,
  filePath: string,
  config: PageRouteMatcherConfig = {},
): PageRoute {
  const pagePath = path.relative(pagesDir, filePath);
  const orderMatch = path.basename(pagePath).match(PAGE_ORDER_RE)?.[1];
  const order = orderMatch ? Number(orderMatch) : undefined;

  let route = stripPageLayoutNameFromPath(stripPageOrderFromPath(pagePath));

  for (const match of pagePath.match(ROUTE_MATCHERS_RE) ?? []) {
    const matcherName = match.slice(1, -1); // slice off `{` and `}`
    const matcher = config[matcherName];

    let value = isFunction(matcher) ? matcher({ filePath, pagePath }) : matcher;

    if (value instanceof RegExp) {
      const regexStr = value.toString();
      value = regexStr.startsWith('/(')
        ? regexStr.slice(1, -1)
        : `(${regexStr.slice(1, -1)})`;
    }

    route = route.replace(`{${matcherName}}`, `${value ?? ''}`);
  }

  const isNotFound = route.startsWith('404');

  const resolveStaticPath = () => {
    if (isNotFound) return '(.*?)';

    const url = new URL(route.toLowerCase(), 'http://localhost/');
    return url.pathname
      .replace(/\..+($|\\?)/i, '.html')
      .replace(/\/(README|index).html($|\?)/i, '/');
  };

  const dynamic = isNotFound || isRoutePathDynamic(slash(route));

  const pathname =
    dynamic && !isNotFound ? slash(path.trimExt(route)) : resolveStaticPath();

  const score = calcRoutePathScore(pathname);
  const pattern = new URLPattern({ pathname });

  return {
    pattern,
    dynamic,
    pathname,
    order,
    score,
  };
}
