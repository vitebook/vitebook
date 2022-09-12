import type { JSONData } from 'server/types';
import type { MarkdownMeta } from 'shared/markdown';
import type { Route, RouteParams } from 'shared/routing';

import type { ClientHttpError } from './errors';
import type { ScrollToTarget } from './scroll-delegate';

// ---------------------------------------------------------------------------------------
// Client Module
// ---------------------------------------------------------------------------------------

export type ClientModuleLoader = () => Promise<ClientModule>;

export type ClientModule = {
  [id: string]: unknown;
  __markdownMeta?: MarkdownMeta;
};

export type LoadedClientModule = ClientModule & {
  readonly staticData?: JSONData;
  readonly serverData?: JSONData;
  readonly error?: Error | ClientHttpError | null;
};

// ---------------------------------------------------------------------------------------
// Client Route
// ---------------------------------------------------------------------------------------

export type ClientRoute = Route & {
  /**
   * Called when a matching link is about to be interacted with. The `prefetch` function can
   * be used to start loading assets before navigation begins.
   */
  readonly prefetch?: ClientRoutePrefetch;
  /**
   * Called when the current route is being navigated to. Generally this should return a JS
   * module.
   */
  readonly loader: ClientRouteLoader;
  /**
   * Whether this route can fetch data from the server. This is is `true` if a page has defined a
   * `serverLoader`. In dev mode it will attempt a fetch regardless.
   */
  readonly fetch?: boolean;
  /**
   * Whether this is a layout route. More than one layout route can be active at a time and can
   * wrap child routes.
   */
  readonly layout?: boolean;
  /**
   * Whether this is an error route. Error routes are matched when a layout or page fails during
   * the data loading process.
   */
  readonly error?: boolean;
};

export type ClientRouteLoader = (info: {
  url: URL;
  route: MatchedClientRoute;
}) => Promise<ClientModule>;

export type ClientRoutePrefetch = (info: {
  url: URL;
  route: MatchedClientRoute;
}) => void | Promise<void>;

export type ClientRouteDeclaration = Omit<
  ClientRoute,
  'id' | 'score' | 'pattern'
> & {
  id?: string | symbol;
  score?: number;
};

export type MatchedClientRoute<Params extends RouteParams = RouteParams> =
  ClientRoute & {
    readonly url: URL;
    readonly params: Params;
  };

export type LoadedClientRoute = MatchedClientRoute & {
  readonly module: LoadedClientModule;
  readonly layouts: LoadedClientRoute[];
};

// ---------------------------------------------------------------------------------------
// Client Navigation
// ---------------------------------------------------------------------------------------

export type Navigation = {
  from: URL | null;
  to: URL;
} | null;

export type RouterGoOptions = {
  scroll?: ScrollToTarget | null;
  keepfocus?: boolean;
  replace?: boolean;
  state?: any;
};

export type NavigationOptions = RouterGoOptions & {
  accepted?: () => void;
  blocked?: () => void;
  redirects?: string[];
};

export type CancelNavigation = () => void;

export type NavigationRedirector = (pathnameOrURL: string | URL) => void;

export type BeforeNavigateHook = (navigation: {
  from: LoadedClientRoute | null;
  to: MatchedClientRoute;
  cancel: CancelNavigation;
  redirect: NavigationRedirector;
}) => void;

export type AfterNavigateHook = (navigation: {
  from: LoadedClientRoute | null;
  to: LoadedClientRoute;
}) => void | Promise<void>;

// ---------------------------------------------------------------------------------------
// Client Manifest
// ---------------------------------------------------------------------------------------

/**
 * ```ts
 * import manifest from ":virtual/vitebook/manifest";
 * ```
 */
export type ClientManifest = {
  /** URL pathname and scores - stored like this to save bytes. */
  paths: [pathname: string, score: number][];
  /** Page, layout, and error module loaders - stored like this to save bytes. */
  loaders: ClientModuleLoader[];
  /** Contains loader indicies ^ who can fetch data from the server. */
  fetch: number[];
  routes: {
    /** id - only available during dev where it's the file system path relative to <root>. */
    i?: string;
    /** pathname = index of path in `paths`. */
    p: number;
    /** module loader = index of loader in `loaders`. */
    m: number;
    /** layout = whether this is a layout. */
    l?: 1;
    /** error = whether this is an error boundary. */
    e?: 1;
  }[];
};
