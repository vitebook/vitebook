import type { RoutesComparator } from './types';

/**
 * Default routes comparator. It doesn't sort or score routes and relies on the work being done
 * server-side.
 */
export function createSimpleComparator(): RoutesComparator {
  return {
    score() {
      return 10000;
    },
    sort(routes) {
      return routes;
    },
  };
}
