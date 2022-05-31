// Client

import type { MarkdownMeta } from './Markdown';

export type WithRouteMatch<T> = T & { match: URLPatternComponentResult };

export type PageRouteMatcher = string | RegExp | null | undefined | void;

export type PageRouteMatcherFn = (input: {
  filePath: string;
  pagePath: string;
}) => PageRouteMatcher;

export type PageRouteMatcherName = string;

export type PageRouteMatcherConfig = Record<
  PageRouteMatcherName,
  PageRouteMatcher | PageRouteMatcherFn
>;

export type PageRoute = {
  /** Page name which can be used to identify route. */
  readonly name?: string;
  /** The page order number if declared (e.g., `[1]page.md` would be 1). */
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
  /**
   * Redirect path if route is matched. When building the site, any routes with `redirect` will
   * use `<meta http-equiv="refresh">`. No other content will be rendered.
   */
  readonly redirect?: string;
};

export type ClientPage = {
  /** Page route object. */
  readonly route: PageRoute;
  /** System file path relative to `<root>` to associated page file. */
  readonly rootPath: string;
  /** Additional page metadata. */
  readonly context: Record<string, unknown>;
  /** Page layouts identifiers. */
  readonly layouts: number[];
  /** Page module loader. Used to dynamically import page module client-side. */
  readonly loader: () => Promise<ClientPageModule>;
};

export type ClientLoadedData = Record<string, unknown>;

export type ClientPageModule = {
  readonly [id: string]: unknown;
  readonly default: unknown;
  readonly meta?: MarkdownMeta;
  readonly loader?: ServerLoader;
};

export type LoadedClientPage = Omit<ClientPage, 'layouts'> & {
  readonly $$loaded: true;
  readonly module: ClientPageModule;
  readonly default: unknown;
  readonly layouts: LoadedClientLayout[];
  readonly data: ClientLoadedData;
};

export type LoadedClientMarkdownPage = LoadedClientPage & {
  readonly meta: MarkdownMeta;
};

export type ClientLayout = {
  /** Layout name. */
  readonly name: string;
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Layout module loader. Used to dynamically import client-side. */
  readonly loader: () => Promise<ClientLayoutModule>;
};

export type ClientLayoutModule = ClientPageModule;

export type LoadedClientLayout = ClientLayout & {
  readonly $$loaded: true;
  readonly module: ClientLayoutModule;
  readonly default: unknown;
  readonly data: ClientLoadedData;
};

// Server

export type ServerPage = Omit<ClientPage, 'loader' | 'layouts'> & {
  /** Module id used by the client-side router to dynamically load this page module.  */
  id: string;
  /** Absolute system file path to page file.  */
  filePath: string;
  /** Page route object. */
  route: PageRoute;
  /** Page layout name. */
  layoutName: string;
  /**
   * Indentifies layout files that belong to this page. Each number is an index to a layout
   * client layout file in the `layouts` store.
   */
  layouts: number[];
  /**
   * Additional data to be included with the page. This will be included in the client-side
   * response.
   */
  context: Record<string, unknown>;
  /** Whether the page has a data `loader` function. */
  hasLoader: boolean;
};

export type ServerLayout = Omit<ClientLayout, 'loader'> & {
  /** Module id used by the client-side router to dynamically load this layout module.  */
  id: string;
  /** Absolute system file path to page file. */
  filePath: string;
  /** The root directory that this layout belongs to. */
  owningDir: string;
  /** Whether the layout has a data `loader` function. */
  hasLoader: boolean;
  /** Whether the current layout resets the layout stack.  */
  reset: boolean;
};

export type ServerLoaderInput = {
  pathname: string;
  page: ServerPage;
  route: PageRoute;
  /** Result from running `URLPattern.exec().pathname`. */
  match: URLPatternComponentResult;
};

export type ServerLoadedData = Record<string, unknown>;

/** Map of data asset id to server loaded data object. */
export type ServerLoadedDataMap = Map<string, ServerLoadedData>;

/** Key can be anything but only truthy values are used to cache. */
export type ServerLoaderCacheKey = unknown;

export type ServerLoaderCacheMap = Map<
  ServerLoaderCacheKey,
  ServerLoadedOutput
>;

export type ServerLoaderCacheKeyBuilder = (
  input: ServerLoaderInput,
) => ServerLoaderCacheKey | Promise<ServerLoaderCacheKey>;

export type ServerLoadedOutput<Data = ServerLoadedData> = {
  data?: Data;
  redirect?: string;
  cache?: ServerLoaderCacheKeyBuilder;
};

/** Map of data asset id to server loaded output object. */
export type ServerLoadedOutputMap = Map<string, ServerLoadedOutput>;

export type MaybeServerLoadedOutput<Data = ServerLoadedData> =
  | void
  | undefined
  | null
  | ServerLoadedOutput<Data>;

export type ServerLoader<Data = ServerLoadedData> = (
  input: ServerLoaderInput,
) => MaybeServerLoadedOutput<Data> | Promise<MaybeServerLoadedOutput<Data>>;
