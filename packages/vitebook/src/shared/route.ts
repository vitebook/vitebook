export type WithRouteMatch<T> = T & { match: URLPatternComponentResult };

export type WithRouteParams<T, U = RouteParams> = T & {
  params: U;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteParams = Record<string, any>;

export type RouteMatcher = string | RegExp | null | undefined | void;

export type SimpleRouterMatcher = {
  name: string;
  matcher: RouteMatcher;
};

export type ComplexRouteMatcher = (
  route: string,
  info: { filePath: string },
) => string | null | undefined | void;

export type RouteMatcherConfig = (SimpleRouterMatcher | ComplexRouteMatcher)[];

export type Route = {
  /** Order number if declared (e.g., `[1]page.md` would be 1). */
  readonly order?: number;
  /**
   * A positive integer representing the path match ranking. The route with the highest score
   * will win if the path matches multiple routes.
   */
  readonly score: number;
  /**
   * `URLPattern` used to match a pattern against a route.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API}
   */
  readonly pattern: URLPattern;
  /**
   * The pathname used to construct the `URLPattern`.
   */
  readonly pathname: string;
  /**
   * Whether the route pattern is dynamic. This includes wildcards `*`,
   * named groups `/:id`, non-capturing groups `{/path}` and RegExp groups `(\\d+)`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax}
   */
  readonly dynamic: boolean;
};
