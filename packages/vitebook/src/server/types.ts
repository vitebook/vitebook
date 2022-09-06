import type { Route, Router } from 'router';

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

  // errors -> maybe not needed here ... just handle it client-side? -- server side we'll store a reference
  // to where the error occurred and find boundary ... -> last seen module???
  // pattern: URLPattern;
  // loader
  // layouts: number[]

  // router needs to be able to load page/catch/error (different modes? - default/catch/error)
  // catchRoutes
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
  /** We store router during SSR so we don't have to rebuild it on each request. */
  serverRouter?: Router;
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
  /** Return router so we can use it on subsequent SSR requests. */
  router: Router;
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
  path: string;
  statusCode: number;
};

export type JSONData = Record<string, unknown>;

// ---------------------------------------------------------------------------------------
// Server Files
// ---------------------------------------------------------------------------------------

export type ServerFile = {
  /** Absolute system file path to file.  */
  readonly filePath: string;
  /** System file path relative to `<root>` to associated file. */
  readonly rootPath: string;
};

export type ServerEndpointFile = ServerFile & {
  /** Routing object. */
  readonly route: Route;
};

export type ServerPageFile = ServerFile & {
  /** Module id used by the client-side router to dynamically load this page module.  */
  readonly id: string;
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Page file extension.  */
  readonly ext: string;
  /** Routing information. */
  readonly route: Route;
  /** Page layout name. */
  readonly layoutName?: string;
  /** Layout files that belong to this page. Each number is an index to a layout node. */
  layouts: number[];
  /** Whether this is a 404 page. */
  is404: boolean;
  /** Whether the page has a `staticLoader` export. */
  hasStaticLoader: boolean;
  /** Whether the page has a `serverLoader` export. */
  hasServerLoader: boolean;
  /** Whether the page has a `serverAction` export. */
  hasServerAction: boolean;
};

export type ServerLayoutFile = ServerFile & {
  /** Module id used by the client-side router to dynamically load this layout module.  */
  readonly id: string;
  /** Layout name. */
  readonly name: string;
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** The root directory that this layout belongs to. */
  readonly owningDir: string;
  /** Whether the layout has a `staticLoader` export. */
  hasStaticLoader: boolean;
  /** Whether the layout has a `serverLoader` export. */
  hasServerLoader: boolean;
  /** Whether the layout has a `serverAction` export. */
  hasServerAction: boolean;
  /** Whether the current layout resets the layout stack.  */
  readonly reset: boolean;
};

// ---------------------------------------------------------------------------------------
// Static Loader
// ---------------------------------------------------------------------------------------

export type StaticLoaderInput<Params extends RequestParams = RequestParams> =
  Readonly<{
    pathname: string;
    page: ServerPageFile;
    route: Route;
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
