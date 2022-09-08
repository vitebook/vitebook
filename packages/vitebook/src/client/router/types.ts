import type { Route, RouteParams } from 'shared/routing';

import type { ScrollToTarget } from './scroll-delegate';

export type ClientRoute = LoadableRoute & {
  // ...
  // we need to know if this and other stuff has loaders.
};

// __markdownMeta?: MarkdownMeta;

export type LoadedClientRoute = LoadedRoute;

export type LoadedRoute = MatchedRoute & {
  readonly module: RouteModule;
};

// -----------------------------------------

export type CSRRoute = {
  id: string;
  errors: Array<CSRPageNodeLoader | undefined>;
  layouts: Array<[boolean, CSRPageNodeLoader] | undefined>;
  leaf: [boolean, CSRPageNodeLoader];
};

export type NavigationIntent = {
  /** `url.pathname + url.search` */
  id: string;
  url: URL;
  route: MatchedRoute;
};

export type NavigationResult = NavigationRedirect | NavigationFinished;

export type NavigationRedirect = {
  type: 'redirect';
  location: string;
};

export type NavigationFinished = {
  type: 'loaded';
  state: NavigationState;
  props: Record<string, any>;
};

export interface NavigationState {
  url: URL;
  error: Error | null;
  params: Record<string, string>;
  route: ClientRoute | null;
  branch: Array<BranchNode | undefined>;
}

// -----------------------------------------

export type GoToRouteOptions = {
  scroll?: ScrollToTarget | null;
  keepfocus?: boolean;
  replace?: boolean;
  state?: any;
};

export type NavigationOptions = GoToRouteOptions & {
  accepted?: () => void;
  blocked?: () => void;
  redirects?: string[];
};

export type CancelNavigation = () => void;

export type RouterBeforeNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: MatchedRoute;
  params: RouteParams;
  cancel: CancelNavigation;
  redirect: RouteRedirector;
}) => void;

export type RouterAfterNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: LoadedRoute;
  params: RouteParams;
}) => void | Promise<void>;

export type RouteRedirector = (pathnameOrURL: string | URL) => void;

export type RouteModule = {
  [id: string]: unknown;
};

export type RoutePrefetch = (info: {
  url: URL;
  route: MatchedRoute;
}) => void | Promise<void>;

export type RouteLoader = (info: {
  url: URL;
  route: MatchedRoute;
}) => RouteModule | Promise<RouteModule>;

export type RouteDeclaration = Omit<
  LoadableRoute,
  'id' | 'score' | 'pattern'
> & {
  id?: string | symbol;
  score?: number;
};

export type LoadableRoute = Route & {
  /**
   * Called when a matching link is about to be interacted with. The `prefetch` function can
   * be used to start loading assets before navigation begins.
   */
  readonly prefetch?: RoutePrefetch;
  /**
   * Called when the current route is being navigated to. Generally this should return a JS
   * module.
   */
  readonly loader: RouteLoader;
};

export type MatchedRoute<Params extends RouteParams = RouteParams> =
  LoadableRoute & {
    readonly url: URL;
    readonly params: Params;
  };

export type RouteTransition = {
  from: URL;
  to: URL;
} | null;
