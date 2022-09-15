import { slash } from 'shared/utils/url';

import type { Route } from './types';

export function filterRoutes<T extends Route>(url: URL, routes: T[]) {
  if (routes.length === 0) return [];

  const filter: [URL, T][] = [];

  // Reverse to ensure correct render order.
  const branch = routes.filter((route) => route.type !== 'page').reverse();
  const segments = decodeURI(url.pathname.slice(1)).split('/');

  let startIndex = 0;
  for (let i = 1; i <= segments.length; i++) {
    url.pathname = segments.slice(0, i).join('/');

    const index = branch
      .slice(startIndex)
      .findIndex((route) => route.pattern.test({ pathname: url.pathname }));

    if (index >= 0) {
      filter.push([new URL(url), branch[index]]);
      startIndex = index;
    }
  }

  const page = findRoute(url, routes, 'page');
  if (page) filter.push([url, page]);

  return filter;
}

export function matchAllRoutes<T extends Route>(url: URL, routes: T[]) {
  return filterRoutes(url, routes).map(
    ([url, route]) => matchRoute(url, [route])!,
  );
}

export function matchRoute<T extends Route>(
  url: URL,
  routes: T[],
  type?: Route['type'],
) {
  const route = findRoute(url, routes, type);
  const match = execRouteMatch(url, route);
  return route && match
    ? { ...route, url, pathId: createPathId(url), params: match.groups }
    : null;
}

export function findRoute<T extends Route>(
  url: URL,
  routes: T[],
  type?: Route['type'],
) {
  return routes.find(
    (route) => (!type || route.type === type) && testRoute(url, route),
  );
}

export function testRoute<T extends Route>(url: URL, route: T) {
  return route.pattern.test({ pathname: url.pathname });
}

export function execRouteMatch<T extends Route>(url: URL, route?: T) {
  return route?.pattern.exec({ pathname: url.pathname })?.pathname;
}

export function normalizeURL(url: URL, trailingSlash = true) {
  url.pathname = url.pathname.replace('/index.html', '/');
  if (!trailingSlash) url.pathname = url.pathname.replace(/\/$/, '');
  return url;
}

export function createPathId(url: URL, baseUrl = '/') {
  const pathname = decodeURI(slash(url.pathname.slice(baseUrl.length)));
  const query = new URLSearchParams(url.search);
  return `${pathname}?${query}`;
}
