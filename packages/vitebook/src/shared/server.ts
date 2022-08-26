import type { ClientLayout, ClientPage } from './client';
import type { RouteInfo } from './route';

export type ServerFile = {
  /** Absolute system file path to file.  */
  readonly filePath: string;
  /** System file path relative to `<root>` to associated file. */
  readonly rootPath: string;
};

export type ServerEndpoint = ServerFile & {
  /** Routing object. */
  readonly route: RouteInfo;
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

export type ServerLoaderParams = {
  [param: string]: string | undefined;
};

export type ServerLoaderInput<
  Params extends ServerLoaderParams = ServerLoaderParams,
> = Readonly<{
  pathname: string;
  page: ServerPage;
  route: RouteInfo;
  params: Params;
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
