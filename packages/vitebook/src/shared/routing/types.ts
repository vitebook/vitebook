import type { HttpError } from './errors';

export type Route = {
  /**
   * A unique value used to identify this route.
   */
  readonly id: string;
  /**
   * - `page`: Leaf UI component.
   * - `layout`: Parent UI components. More than one layout route can be active at a time.
   * - `error`: Error boundary components. More than one can be active a time.
   * - `endpoint`: HTTP endpoint - only exists server-side.
   */
  readonly type: 'page' | 'layout' | 'error' | 'endpoint';
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
   * Whether the route pattern is dynamic. This includes wildcards `*`, named groups `/:id`,
   * non-capturing groups `{/path}` and RegExp groups `(\\d+)`.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API#pattern_syntax}
   */
  readonly dynamic?: boolean;
};

export type RouteModule = {
  [id: string]: unknown;
};

export type LoadableRoute<Module extends RouteModule = RouteModule> = Route & {
  /**
   * Called when the current route is being navigated to. Generally this should return a JS
   * module.
   */
  readonly loader: () => Promise<Module>;
  /**
   * Whether this route can fetch data from the server. This is is `true` if a page has defined a
   * `serverLoader`. In dev mode it will attempt a fetch regardless.
   */
  readonly canFetch?: boolean;
};

export type MatchedRoute<
  Route extends LoadableRoute = LoadableRoute,
  Params extends RouteParameters = RouteParameters,
> = Route & {
  readonly url: URL;
  readonly pathId: string;
  readonly params: Params;
};

export type LoadedStaticData = Record<string, unknown>;
export type LoadedServerData = unknown;

export type LoadedRoute<
  Route extends MatchedRoute = MatchedRoute,
  Module extends RouteModule = RouteModule,
> = Route & {
  readonly module: Module;
  readonly staticData: LoadedStaticData;
  readonly serverData: LoadedServerData;
  readonly loadError?: Error | HttpError | null;
  readonly branch: Omit<LoadedRoute<Route, Module>, 'branch'>[];
};

export type RouteParameters = Record<string, string | undefined>;
