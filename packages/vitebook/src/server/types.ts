import type { ClientLayout, ClientPage } from 'client/types';
import type { Route } from 'router/types';

export type ServerFile = {
  /** Absolute system file path to file.  */
  readonly filePath: string;
  /** System file path relative to `<root>` to associated file. */
  readonly rootPath: string;
};

export type ServerEndpoint = ServerFile & {
  /** Routing object. */
  readonly route: Route;
};

export type ServerPage = ServerFile &
  Omit<ClientPage, 'loader' | 'layouts'> & {
    /** Module id used by the client-side router to dynamically load this page module.  */
    id: string;
    /** Routing object. */
    readonly route: Route;
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
    /** Whether the page has any server-side loader. */
    hasAnyLoader: boolean;
    /** Whether the page has a `staticLoader` function. */
    hasStaticLoader: boolean;
    /** Whether the page has a `serverLoader` function. */
    hasServerLoader: boolean;
  };

export type ServerLayout = ServerFile &
  Omit<ClientLayout, 'loader'> & {
    /** Module id used by the client-side router to dynamically load this layout module.  */
    id: string;
    /** The root directory that this layout belongs to. */
    readonly owningDir: string;
    /** Whether the page has any server-side loader. */
    hasAnyLoader: boolean;
    /** Whether the page has a `staticLoader` function. */
    hasStaticLoader: boolean;
    /** Whether the page has a `serverLoader` function. */
    hasServerLoader: boolean;
    /** Whether the current layout resets the layout stack.  */
    reset: boolean;
  };

export type ServerLoaderParams = {
  [param: string]: string | undefined;
};

export type ServerRedirect = {
  path: string;
  statusCode: number;
};

// ---------------------------------------------------------------------------------------
// Static Loader
// ---------------------------------------------------------------------------------------

export type StaticLoaderInput<
  Params extends ServerLoaderParams = ServerLoaderParams,
> = Readonly<{
  pathname: string;
  page: ServerPage;
  route: Route;
  params: Partial<Params>;
  /** Result from running `URLPattern.exec().pathname`. */
  match: URLPatternComponentResult;
}>;

export type StaticLoadedData = Record<string, unknown>;

/** Map of data asset id to server loaded data object. */
export type StaticLoaderDataMap = Map<string, StaticLoadedData>;

/** Map of data asset id to server loaded output object. */
export type StaticLoaderOutputMap = Map<string, StaticLoadedOutput>;

/** Key can be anything but only truthy values are cached. */
export type StaticLoaderCacheKey = unknown;

export type StaticLoaderCacheMap = Map<
  StaticLoaderCacheKey,
  StaticLoadedOutput
>;

export type StaticLoaderCacheKeyBuilder = (
  input: StaticLoaderInput,
) => StaticLoaderCacheKey | Promise<StaticLoaderCacheKey>;

export type StaticLoadedOutput<Data = StaticLoadedData> = {
  data?: Data;
  readonly redirect?: string | { path: string; statusCode?: number };
  readonly cache?: StaticLoaderCacheKeyBuilder;
};

export type MaybeStaticLoadedOutput<Data = StaticLoadedData> =
  | void
  | undefined
  | null
  | StaticLoadedOutput<Data>;

export type StaticLoader<
  Params extends ServerLoaderParams = ServerLoaderParams,
  Data extends StaticLoadedData = StaticLoadedData,
> = (
  input: StaticLoaderInput<Params>,
) => MaybeStaticLoadedOutput<Data> | Promise<MaybeStaticLoadedOutput<Data>>;

// ---------------------------------------------------------------------------------------
// Server Loader
// ---------------------------------------------------------------------------------------

export type ServerLoaderInput<
  Params extends ServerLoaderParams = ServerLoaderParams,
> = {
  request: Request;
  params: Partial<Params>;
  /** Result from running `URLPattern.exec().pathname`. */
  match: URLPatternComponentResult;
};

export type ServerLoaderOutput = Response | Record<string, unknown>;

export type ServerLoader<
  Params extends ServerLoaderParams = ServerLoaderParams,
> = (
  input: ServerLoaderInput<Params>,
) => ServerLoaderOutput | Promise<ServerLoaderOutput>;

// ---------------------------------------------------------------------------------------
// SSR
// ---------------------------------------------------------------------------------------

export type ServerContext = {
  modules: Set<string>;
  data: StaticLoaderDataMap;
};

export type ServerEntryModule = {
  render: ServerRenderer;
};

export type ServerRenderResult = {
  head?: string;
  css?: string;
  html: string;
  context: ServerContext;
};

export type ServerRenderer = (
  url: URL,
  context: { data: ServerContext['data'] },
) => Promise<ServerRenderResult>;
