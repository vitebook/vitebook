import type { Route } from 'shared/routing';

import type {
  RequestEvent,
  RequestModule,
  RequestParams,
} from './http/request';

// ---------------------------------------------------------------------------------------
// SSR
// ---------------------------------------------------------------------------------------

export type ServerBuild = {
  mode: 'development' | 'production';

  template: string;
  trailingSlash: boolean;

  entry: {
    filename: string;
    loader: ServerEntryLoader;
  };

  statics: {
    data: Record<string, StaticDataLoader>;
    dataHashMap: Record<string, string>;
    redirects: { from: string; to: string }[];
  };

  // id => head/body

  routes: {
    pages: ServerNodeRoute[];
    layouts: ServerNodeRoute[];
    errors: ServerNodeRoute[];
    endpoints: ServerNodeRoute<ServerEndpointLoader>[];
  };
};

export type ServerEntryContext = {
  staticData: StaticLoaderDataMap;
};

export type ServerEntryModule = {
  render: ServerRenderer;
};

export type ServerEntryLoader = () => Promise<ServerEntryModule>;

export type ServerRenderer = (
  url: URL,
  context: Partial<ServerEntryContext>,
) => Promise<ServerRenderResult>;

export type ServerRenderResult = {
  head?: string;
  css?: string;
  html: string;
};

export type ServerNode = {
  staticLoader?: StaticLoader;
  serverLoader?: ServerLoader;
  serverAction?: ServerAction;
};

export type ServerNodeLoader = (
  id?: string,
) => ServerNode | Promise<ServerNode>;

export type ServerNodeRoute<Loader = ServerNodeLoader> = {
  pathname: string;
  fetch?: boolean;
  loader: Loader;
};

export type ServerRequestHandler = (request: Request) => Promise<Response>;

export type ServerRedirect = {
  readonly pathname: string;
  readonly statusCode: number;
};

export type ServerEndpointLoader = () => Promise<RequestModule>;

export type JSONData = Record<string, unknown>;

export type StaticDataLoader = () => Promise<JSONData>;

// ---------------------------------------------------------------------------------------
// Static Loader
// ---------------------------------------------------------------------------------------

export type StaticLoaderInput<Params extends RequestParams = RequestParams> =
  Readonly<{
    route: Route;
    pathname: string;
    params: Partial<Params>;
    /** Result from running `URLPattern.exec().pathname`. */
    match: URLPatternComponentResult;
  }>;

/** Map of data asset id to server loaded data object. */
export type StaticLoaderDataMap = Map<string, JSONData>;

/** Map of data asset id to server loaded output object. */
export type StaticLoaderOutputMap = Map<string, StaticLoaderOutput>;

/** Key can be anything but only truthy values are cached. */
export type StaticLoaderCacheKey = unknown;

export type StaticLoaderCacheMap = Map<
  StaticLoaderCacheKey,
  StaticLoaderOutput
>;

export type StaticLoaderCacheKeyBuilder = (
  input: StaticLoaderInput,
) => StaticLoaderCacheKey | Promise<StaticLoaderCacheKey>;

export type StaticLoader<
  Params extends RequestParams = RequestParams,
  Data extends JSONData = JSONData,
> = (
  input: StaticLoaderInput<Params>,
) => MaybeStaticLoaderOutput<Data> | Promise<MaybeStaticLoaderOutput<Data>>;

export type StaticLoaderOutput<Data = JSONData> = {
  data?: Data;
  readonly redirect?: string | { path: string; statusCode?: number };
  readonly cache?: StaticLoaderCacheKeyBuilder;
};

export type MaybeStaticLoaderOutput<Data = JSONData> =
  | void
  | undefined
  | null
  | StaticLoaderOutput<Data>;

// ---------------------------------------------------------------------------------------
// Server Loader
// ---------------------------------------------------------------------------------------

export type ServerLoader<Params extends RequestParams = RequestParams> = (
  event: RequestEvent<Params>,
) => ServerLoaderOutput | Promise<ServerLoaderOutput>;

export type ServerLoaderOutput = Response | JSONData;

// ---------------------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------------------

export type ServerAction<Params extends RequestParams = RequestParams> = (
  event: RequestEvent<Params>,
) => ServerLoaderOutput | Promise<ServerLoaderOutput>;
