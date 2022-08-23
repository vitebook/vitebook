import path from 'upath';

import {
  calcRoutePathScore,
  endslash,
  isFunction,
  isRoutePathDynamic,
  type RouteInfo,
  type RouteMatcherConfig,
  slash,
  stripPageOrderFromPath,
} from '../../../shared';

const PAGE_ORDER_RE = /^\[(\d*)\]/;

export function stripRouteMetaFromFilePath(filePath: string) {
  const ext = path.extname(filePath);
  const stripped = filePath.replace(
    new RegExp(`@(\\w|\\+)+\\.${ext.slice(1)}$`, 'i'),
    ext,
  );
  return stripped === ext
    ? `index${ext}`
    : stripped.replace(`/${ext}`, `/index${ext}`);
}

export function stripRouteInfoFromFilePath(filePath: string) {
  return stripRouteMetaFromFilePath(stripPageOrderFromPath(filePath));
}

export function resolveRouteFromFilePath(
  routesDir: string,
  filePath: string,
  matchers: RouteMatcherConfig = {},
): RouteInfo {
  const routePath = path.relative(routesDir, filePath);
  const orderMatch = path.basename(routePath).match(PAGE_ORDER_RE)?.[1];
  const order = orderMatch ? Number(orderMatch) : undefined;

  const isNotFound = path.basename(routePath).startsWith('@404');
  let route = stripRouteInfoFromFilePath(routePath);

  for (const matcherName of Object.keys(matchers)) {
    const matcher = matchers[matcherName];

    let value = isFunction(matcher)
      ? matcher({ filePath, routePath: routePath })
      : matcher;

    if (value instanceof RegExp) {
      const regexStr = value.toString();
      value = regexStr.startsWith('/(')
        ? regexStr.slice(1, -1)
        : `(${regexStr.slice(1, -1)})`;
    }

    route = route.replace(`[${matcherName}]`, `${value ?? ''}`);
  }

  const resolveStaticPath = () => {
    const url = new URL(route.toLowerCase(), 'http://v/');
    return url.pathname
      .replace(/\..+($|\\?)/i, '{.html}?')
      .replace(/\/(README|index){.html}\?($|\?)/i, '{/}?{index}?{.html}?');
  };

  const dynamic = isNotFound || isRoutePathDynamic(route);

  const pathname = isNotFound
    ? `${route.replace(path.basename(route), '')}(.*?)`
    : dynamic
    ? slash(
        path.trimExt(route).replace(/\/index$/, '{/}?{index}?{.html}?'),
      ).replace(/\/?$/, '{/}?')
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
  routesDir: string,
  filePath: string,
) {
  const routePath = endslash(path.relative(routesDir, filePath));

  const url = new URL(
    stripRouteInfoFromFilePath(routePath).toLowerCase(),
    'http://localhost',
  );

  return url.pathname
    .replace(/\..+($|\\?)/i, '.html')
    .replace(/\/(README|index).html($|\\?)/i, '/');
}
