import path from 'upath';

import {
  calcRoutePathScore,
  isFunction,
  isRoutePathDynamic,
  type PageRoute,
  type PageRouteMatcherConfig,
  slash,
  stripPageOrderFromPath,
} from '../../../../shared';

const LAYOUT_NAME_RE = /(.*?)@layout/;
const PAGE_ORDER_RE = /^\[(\d*)\]/;

export function getPageLayoutNameFromFilePath(filePath: string) {
  const filename = path
    .basename(filePath, path.extname(filePath))
    .replace(/\.reset($|\/)/, '');
  const match = filename.match(LAYOUT_NAME_RE)?.[1];
  return match && match.length > 0 ? match : filename;
}

export function stripPageLayoutNameFromFilePath(filePath: string) {
  const ext = path.extname(filePath);
  return filePath.replace(new RegExp(`@\\w+\\.${ext.slice(1)}$`, 'i'), ext);
}

export function stripPageInfoFromFilePath(filePath: string) {
  return stripPageLayoutNameFromFilePath(stripPageOrderFromPath(filePath));
}

export function resolvePageRouteFromFilePath(
  pagesDir: string,
  filePath: string,
  matchers: PageRouteMatcherConfig = {},
): PageRoute {
  const pagePath = path.relative(pagesDir, filePath);
  const orderMatch = path.basename(pagePath).match(PAGE_ORDER_RE)?.[1];
  const order = orderMatch ? Number(orderMatch) : undefined;

  let route = stripPageInfoFromFilePath(pagePath);

  for (const matcherName of Object.keys(matchers)) {
    const matcher = matchers[matcherName];

    let value = isFunction(matcher) ? matcher({ filePath, pagePath }) : matcher;

    if (value instanceof RegExp) {
      const regexStr = value.toString();
      value = regexStr.startsWith('/(')
        ? regexStr.slice(1, -1)
        : `(${regexStr.slice(1, -1)})`;
    }

    route = route.replace(`[${matcherName}]`, `${value ?? ''}`);
  }

  const isNotFound = route.startsWith('404');

  const resolveStaticPath = () => {
    if (isNotFound) return '(.*?)';

    const url = new URL(route.toLowerCase(), 'http://v/');
    return url.pathname
      .replace(/\..+($|\\?)/i, '{.html}?')
      .replace(/\/(README|index){.html}\?($|\?)/i, '{/}?{index}?{.html}?');
  };

  const dynamic = isNotFound || isRoutePathDynamic(route);

  const pathname =
    dynamic && !isNotFound
      ? slash(path.trimExt(route).replace(/\/index$/, '/'))
      : resolveStaticPath();

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

export function resolveStaticRouteFromFilePath(
  pagesDir: string,
  filePath: string,
) {
  const pagePath = path.relative(pagesDir, filePath);

  const url = new URL(
    stripPageInfoFromFilePath(pagePath).toLowerCase(),
    'http://localhost',
  );

  return url.pathname
    .replace(/\..+($|\\?)/i, '.html')
    .replace(/\/(README|index).html($|\\?)/i, '/');
}
