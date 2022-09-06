import type { LoadedClientPage } from 'client/types';
import type { ServerEntryContext } from 'server/types';

import type { Reactive } from './reactivity';
import type { ScrollToTarget } from './scroll-delegate';

export type Route = {
  /** Order number if declared (e.g., `[1]page.md` would be 1). */
  readonly order?: number;
  /**
   * A positive integer representing the path match ranking. The route with the highest score
   * will win if the path matches multiple routes.
   */
  readonly score: number;
  /**
   * `URLPattern` used to match a pattern against a URL.
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

export type RouteRedirect = (pathnameOrURL: string | URL) => void;

export type RoutePrefetch = (info: {
  url: URL;
  route: MatchedRoute;
  redirect: RouteRedirect;
}) => void | Promise<void>;

export type RouteLoader = (info: {
  route: MatchedRoute;
  redirect: RouteRedirect;
}) => void | LoadedClientPage | Promise<void | LoadedClientPage>;

export type RouteDeclaration = Route & {
  prefetch?: RoutePrefetch;
  loader: RouteLoader;
};

export type UserRouteDeclaration = Omit<RouteDeclaration, 'score'> & {
  score?: number;
};

export type ScoredRouteDeclaration = RouteDeclaration & {
  readonly score: number;
};

export type RouterOptions = {
  baseUrl: string;
  history: History;
  trailingSlash?: boolean;
  $route: Reactive<LoadedRoute>;
  $navigation: Reactive<RouteNavigation>;
  initialRoutes?: RouteDeclaration[];
  serverContext?: ServerEntryContext;
};

export type MatchedRoute = RouteDeclaration & {
  readonly id: string;
  readonly url: URL;
  readonly params: RouteParams;
};

export type RouteNavigation = {
  from: URL;
  to: URL;
} | null;

export type LoadedRoute = MatchedRoute & {
  page: LoadedClientPage;
};

export type GoToRouteOptions = {
  scroll?: ScrollToTarget | null;
  keepfocus?: boolean;
  replace?: boolean;
  state?: any;
};

export type NavigationOptions = GoToRouteOptions & {
  accepted?: () => void;
  blocked?: () => void;
};

export type CancelNavigation = () => void;

export type RouterBeforeNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: WithRouteParams<RouteDeclaration>;
  params: RouteParams;
  cancel: CancelNavigation;
  redirect: RouteRedirect;
}) => void;

export type RouterAfterNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: LoadedRoute;
  params: RouteParams;
}) => void | Promise<void>;

export type WithRouteMatch<T> = T & { match: URLPatternComponentResult };

export type WithRouteParams<T, U = RouteParams> = T & {
  params: U;
};

export type RouteParams = Record<string, any>;

export type RouteMatcher = string | RegExp | null | undefined | void;

export type SimpleRouteMatcher = {
  name: string;
  matcher: RouteMatcher;
};

export type ComplexRouteMatcher = (
  route: string,
  info: { filePath: string },
) => string | null | undefined | void;

export type RouteMatcherConfig = (SimpleRouteMatcher | ComplexRouteMatcher)[];
