import type {
  RouteDeclaration,
  ScoredRouteDeclaration,
  UserRouteDeclaration,
  WithRouteParams,
} from '../types';

export type RoutesComparator = {
  /**
   * Matches the URL to a route in the given `routes` list.
   */
  match(
    url: URL,
    routes: RouteDeclaration[],
  ): WithRouteParams<RouteDeclaration> | null;
  /**
   * Returns a score for ranking the given route. Routes with a higher score should be matched
   * before routes with a lower score.
   */
  score(route: UserRouteDeclaration): number;
  /**
   * Sorts the routes list into the order in which they should be matched. Routes at earlier
   * positions should match first.
   */
  sort(routes: ScoredRouteDeclaration[]): ScoredRouteDeclaration[];
};

export type RoutesComparatorFactory = () => RoutesComparator;
