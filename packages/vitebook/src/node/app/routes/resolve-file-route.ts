import { normalizePath, trimExt } from 'node/utils';
import path from 'node:path';
import {
  calcRoutePathScore,
  isRoutePathDynamic,
  type Route,
} from 'shared/routing';
import { isFunction } from 'shared/utils/unit';
import { endslash, slash } from 'shared/utils/url';

import type { RouteMatcher, RouteMatcherConfig } from '../config';

const PAGE_ORDER_RE = /^\[(\d+)\]/;

const STRIP_PAGE_ORDER_RE = /\/\[(\d+)\]/g;
const STRIP_ROUTE_GROUPS_RE = /\/\(.*?\)\//g;

export function stripPageOrder(filePath: string) {
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
    .map(stripPageOrder);
}

export function stripRouteMeta(filePath: string) {
  const basename = path.posix.basename(filePath);
  return filePath.replace(basename, 'index.html');
}

export function stripRouteGroups(filePath: string) {
  return filePath.replace(STRIP_ROUTE_GROUPS_RE, '');
}

export function stripRouteInfo(filePath: string) {
  return stripRouteMeta(stripPageOrder(filePath));
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
  isEndpoint = false,
): Route {
  filePath = normalizePath(filePath);

  const routePath = path.posix.relative(routesDir, filePath);
  const basename = path.posix.basename(routePath);
  const orderMatch = basename.match(PAGE_ORDER_RE)?.[1];
  const order = orderMatch ? Number(orderMatch) : undefined;

  let route = stripRouteInfo(routePath);

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

  const dynamic = isRoutePathDynamic(route);

  const pathname =
    dynamic || isEndpoint
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
    id: routePath,
    pathname,
    pattern,
    dynamic,
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
    stripRouteInfo(routePath).toLowerCase(),
    'http://localhost',
  );

  return url.pathname
    .replace(/\..+($|\\?)/i, '.html')
    .replace(/\/(README|index).html($|\\?)/i, '/');
}
