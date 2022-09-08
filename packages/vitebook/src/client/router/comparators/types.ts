import type { LoadableRoute, MatchedRoute, RouteDeclaration } from '../types';

export type RoutesComparator = {
  /**
   * Matches the URL to a route in the given `routes` list.
   */
  match(url: URL, routes: LoadableRoute[]): MatchedRoute | null;
  /**
   * Returns a score for ranking the given route. Routes with a higher score should be matched
   * before routes with a lower score.
   */
  score(route: RouteDeclaration): number;
  /**
   * Sorts the routes list into the order in which they should be matched. Routes at earlier
   * positions should match first.
   */
  sort(routes: LoadableRoute[]): LoadableRoute[];
};

export type RoutesComparatorFactory = () => RoutesComparator;
