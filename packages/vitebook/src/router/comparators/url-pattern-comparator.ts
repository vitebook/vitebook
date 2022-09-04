import { calcRoutePathScore, compareRoutes, matchRoute } from '../match';
import type { RoutesComparator } from './types';

/**
 * Uses the same route matching, scoring/ranking, and sorting algorithm as the server-side
 * implementation. This can be used when you're programtically creating routes client-side. Be
 * careful because this comparator weighs a ~few KB, hence why it's not the default.
 */
export function createURLPatternRouteMatcher(): RoutesComparator {
  return {
    match(url, routes) {
      const route = matchRoute(url, routes);
      return route
        ? {
            ...route,
            params: route?.match.groups ?? {},
          }
        : null;
    },
    score(route) {
      return calcRoutePathScore(route.pathname);
    },
    sort(routes) {
      return routes.sort(compareRoutes);
    },
  };
}
