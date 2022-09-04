import { execRouteMatch } from '../match';
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
        return { ...route, params: match?.groups ?? {} };
      }

      return null;
    },
    score() {
      // By default we don't score anything and just push new routes to the top. We're relying on
      // the fact that routes are scored server-side.
      return 1000;
    },
    sort(routes) {
      // By default we don't sort routes and rely on them being sorted server-side.
      return routes;
    },
  };
}
