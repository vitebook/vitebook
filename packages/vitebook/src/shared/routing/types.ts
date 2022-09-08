export type Route = {
  /**
   * A unique value used to identify this route.
   */
  readonly id: string | symbol;
  /**
   * Order number if declared (e.g., `[1]page.md` would be 1).
   */
  readonly order?: number;
  /**
   * A positive integer representing the path match ranking. The route with the highest score
   * will win if the path matches multiple routes.
   */
  readonly score: number;
  /**
   * The `pathname` is the string used to the construct the `URLPattern`.
   */
  readonly pathname: string;
  /**
   * `URLPattern` used to match a pattern against a URL.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API}
   */
  readonly pattern: URLPattern;
  /**
   * Whether the route pattern is dynamic. This includes wildcards `*`,
   * named groups `/:id`, non-capturing groups `{/path}` and RegExp groups `(\\d+)`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax}
   */
  readonly dynamic?: boolean;
};

export type RouteParams = Record<string, string | undefined>;

export type MatchableRoute = {
  pattern: URLPattern;
};

export type WithRouteMatch<T> = T & { match: URLPatternComponentResult };
