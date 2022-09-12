import { execRouteMatch } from 'shared/routing';

import type { RoutesComparator } from './types';

/**
 * Default routes comparator. It doesn't sort or score routes and relies on the work being done
 * server-side. This comparator's main job is match routes to the given URL.
 */
export function createSimpleRoutesComparator(): RoutesComparator {
  return {
    match(url, routes) {
      const route = routes.find((route) =>
        route.pattern.test({ pathname: url.pathname }),
      );

      if (route) {
        const match = execRouteMatch(url, route);
        return { url, ...route, params: match?.groups ?? {} };
      }

      return null;
    },
    score() {
      return 1000;
    },
    sort(routes) {
      return routes.sort((a, b) => b.score - a.score);
    },
  };
}
