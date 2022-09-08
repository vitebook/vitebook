import type { Route } from 'shared/routing';

import type { RequestEvent, RequestParams } from './http/request';

// ---------------------------------------------------------------------------------------
// SSR
// ---------------------------------------------------------------------------------------

export type ServerBuild = {
  template: string;
  trailingSlash: boolean;

  // staticDataHashMap
  // staticRedirects {from; to; }[]

  entry: {
    filename: string;
    loader: () => Promise<ServerEntryModule>;
  };

  app: {
    filename: string;
    loader: () => Promise<ServerEntryModule>;
  };

  // NODE
  // id => root path
  // pattern: URLPattern;
  // head: string
  // body: string
  // loader
  // layouts: number[]
  // staticData: JSONData

  // layouts
  // loader

  // TODO: REFACTOR ROUTES AS FIRST-CLASS -> page? layouts/errors
  // router has current nodes list { module: ..., props: {} }

  // errors -> maybe not needed here ... just handle it client-side? -- server side we'll store a reference
  // to where the error occurred and find boundary ... -> last seen module???
  // pattern: URLPattern;
  // loader
  // layouts: number[]

  // router needs to be able to load page/error (different modes? - default/error)
  // errorRoutes
  // maybe just forward a loader and let router handle it

  // endpoints so we can handle them locally (without http)
};

export type ServerRenderState = {
  // Nothing for now - not used yet.
};

export type ServerEntryContext = {
  state: ServerRenderState;
  modules: Set<string>;
  staticData: StaticLoaderDataMap;
};

export type ServerEntryModule = {
  render: ServerRenderer;
};

export type ServerRenderer = (
  url: URL,
  context: Partial<ServerEntryContext>,
) => Promise<ServerRenderResult>;

export type ServerRenderResult = {
  head?: string;
  css?: string;
  html: string;
  context: ServerEntryContext;
};

export type ServerNode = {
  loader: ServerNodeLoader;
};

export type ServerNodeModule = {
  staticLoader?: StaticLoader;
  serverLoader?: ServerLoader;
  serverAction?: ServerAction;
};

export type ServerNodeLoader = (
  id?: string,
) => ServerNodeModule | Promise<ServerNodeModule>;

export type ServerRequestHandler = (request: Request) => Promise<Response>;

export type ServerRedirect = {
  readonly path: string;
  readonly statusCode: number;
};

export type JSONData = Record<string, unknown>;

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
