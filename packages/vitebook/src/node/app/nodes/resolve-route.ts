import path from 'node:path';

import {
  calcRoutePathScore,
  endslash,
  isFunction,
  isRoutePathDynamic,
  type RouteInfo,
  type RouteMatcher,
  type RouteMatcherConfig,
  slash,
  stripPageOrderFromPath,
} from '../../../shared';
import { normalizePath, trimExt } from '../../utils';

const PAGE_ORDER_RE = /^\[(\d*)\]/;

export function stripRouteMetaFromFilePath(filePath: string) {
  const ext = path.posix.extname(filePath);
  const stripped = filePath.replace(
    new RegExp(`@(\\w|\\+)+\\.${ext.slice(1)}$`, 'i'),
    ext,
  );
  return stripped === ext
    ? `index${ext}`
    : ext
    ? stripped.replace(`/${ext}`, `/index${ext}`)
    : stripped.replace(/\/?$/, '/index.html');
}

export function stripRouteInfoFromFilePath(filePath: string) {
  return stripRouteMetaFromFilePath(stripPageOrderFromPath(filePath));
}

function normalizeTransformMatcher(value: RouteMatcher) {
  if (value instanceof RegExp) {
    const regexStr = value.toString();
    value = regexStr.startsWith('/(')
      ? regexStr.slice(1, -1)
      : `(${regexStr.slice(1, -1)})`;
  }

  return value ?? '';
}

export function resolveRouteFromFilePath(
  routesDir: string,
  filePath: string,
  matchers: RouteMatcherConfig = [],
): RouteInfo {
  filePath = normalizePath(filePath);

  const routePath = path.posix.relative(routesDir, filePath);
  const basename = path.posix.basename(routePath);
  const orderMatch = basename.match(PAGE_ORDER_RE)?.[1];
  const order = orderMatch ? Number(orderMatch) : undefined;

  const isNotFound = basename.includes('@404');
  const isEndpoint = basename.includes('@http');

  let route = stripRouteInfoFromFilePath(routePath);

  for (const matcher of matchers) {
    if (isFunction(matcher)) {
      const result = matcher(route, { filePath });
      if (result) route = result;
    } else {
      route = route.replace(
        `[${matcher.name}]`,
        normalizeTransformMatcher(matcher.matcher),
      );
    }
  }

  const resolveStaticPath = () => {
    const url = new URL(route.toLowerCase(), 'http://v/');
    return url.pathname
      .replace(/\..+($|\\?)/i, '{.html}?')
      .replace(/\/(README|index){.html}\?($|\?)/i, '{/}?{index}?{.html}?');
  };

  const dynamic = isNotFound || isRoutePathDynamic(route);

  const pathname = isNotFound
    ? `${route.replace(path.posix.basename(route), '')}(.*?)`
    : dynamic || isEndpoint
    ? slash(
        trimExt(route).replace(
          /\/(index)?(\.html)?$/,
          isEndpoint ? '{/}?' : '{/}?{index}?{.html}?',
        ),
      )
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
  const routePath = endslash(path.posix.relative(routesDir, filePath));

  const url = new URL(
    stripRouteInfoFromFilePath(routePath).toLowerCase(),
    'http://localhost',
  );

  return url.pathname
    .replace(/\..+($|\\?)/i, '.html')
    .replace(/\/(README|index).html($|\\?)/i, '/');
}
