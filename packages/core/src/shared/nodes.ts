// Client

import type { MarkdownMeta } from './markdown';

export type WithRouteMatch<T> = T & { match: URLPatternComponentResult };

export type RouteMatcher = string | RegExp | null | undefined | void;

export type RouteMatcherFn = (input: {
  filePath: string;
  routePath: string;
}) => RouteMatcher;

export type RouteMatcherName = string;

export type RouteMatcherConfig = Record<
  RouteMatcherName,
  RouteMatcher | RouteMatcherFn
>;

export type RouteInfo = {
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

export type ClientPage = {
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Page route object. */
  readonly route: RouteInfo;
  /** Page file extension.  */
  readonly ext: string;
  /** Additional page metadata. */
  readonly context?: Record<string, unknown>;
  /** Page layout name. */
  readonly layoutName?: string;
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

export type ServerFile = {
  /** Absolute system file path to file.  */
  readonly filePath: string;
  /** System file path relative to `<root>` to associated file. */
  readonly rootPath: string;
};

export type ServerFunction = ServerFile & {
  /** Routing object. */
  readonly route: RouteInfo;
  /** Whether this is an edge function. */
  readonly edge: boolean;
};

export type ServerPage = ServerFile &
  Omit<ClientPage, 'loader' | 'layouts'> & {
    /** Module id used by the client-side router to dynamically load this page module.  */
    id: string;
    /** Routing object. */
    readonly route: RouteInfo;
    /** Page layout name. */
    layoutName?: string;
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

export type ServerLayout = ServerFile &
  Omit<ClientLayout, 'loader'> & {
    /** Module id used by the client-side router to dynamically load this layout module.  */
    id: string;
    /** The root directory that this layout belongs to. */
    readonly owningDir: string;
    /** Whether the layout has a data `loader` function. */
    hasLoader: boolean;
    /** Whether the current layout resets the layout stack.  */
    reset: boolean;
  };

export type ServerLoaderInput = Readonly<{
  pathname: string;
  page: ServerPage;
  route: RouteInfo;
  /** Result from running `URLPattern.exec().pathname`. */
  match: URLPatternComponentResult;
}>;

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
  readonly redirect?: string;
  readonly cache?: ServerLoaderCacheKeyBuilder;
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
