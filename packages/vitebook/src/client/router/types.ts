import type { MarkdownMeta } from 'shared/markdown';
import type { LoadableRoute, LoadedRoute, MatchedRoute } from 'shared/routing';

import type { ScrollToTarget } from './scroll-delegate';

// ---------------------------------------------------------------------------------------
// Client Module
// ---------------------------------------------------------------------------------------

export type ClientModule = {
  [id: string]: unknown;
  __markdownMeta?: MarkdownMeta;
};

export type ClientModuleLoader = () => Promise<ClientModule>;

// ---------------------------------------------------------------------------------------
// Client Route
// ---------------------------------------------------------------------------------------

export type ClientRoute = LoadableRoute<ClientModule>;

export type ClientRoutePrefetch = (info: {
  url: URL;
  route: MatchedClientRoute;
}) => void | Promise<void>;

export type ClientRouteDeclaration = Omit<
  ClientRoute,
  'id' | 'score' | 'pattern'
> & {
  id?: string;
  score?: number;
};

export type MatchedClientRoute = MatchedRoute<ClientRoute>;
export type LoadedClientRoute = LoadedRoute<MatchedClientRoute, ClientModule>;

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
}) => void | Promise<void>;

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
  /** Routes - their type is prepended with a `$` = `1$` = layout, `2$` = error  */
  routes: string[];
};
