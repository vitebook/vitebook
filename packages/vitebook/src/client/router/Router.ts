import type { ServerContext, WithRouteParams } from '../../shared';
import type { Reactive } from '../reactivity';
import type { RoutesComparatorFactory } from './comparators/types';
import type { ScrollDelegate, ScrollDelegateFactory } from './scroll-delegate';
import type {
  GoToRouteOptions,
  LoadedRoute,
  MatchedRoute,
  NavigationOptions,
  RouteDeclaration,
  RouteNavigation,
  RouterAfterNavigateHook,
  RouterBeforeNavigateHook,
  UserRouteDeclaration,
} from './types';

export type Router = {
  /**
   * The current URL.
   */
  readonly url: URL;
  /**
   * Manager used to handle scrolling-related tasks. A manager doesn't exist by default and needs
   * to be added via `addScrollManager(...)`
   */
  readonly scroll: ScrollDelegate;
  /**
   * Whether the router is disabled. Disabling the router means the browser will handle all
   * navigation and calling `goto` will be a no-op.
   *
   * @defaultValue `false`
   */
  disabled: boolean;
  /**
   * The base URL for all routes.
   *
   * @defaultValue `'/'`
   */
  readonly baseUrl: string;
  /**
   * Available during SSR.
   */
  readonly serverContext?: ServerContext;
  /**
   * Whether a slash should be appended to the end of HTML routes. This is modified by adapters
   * accordingly by injecting `__VBK_TRAILING_SLASH__` into the `window` object.
   *
   * @defaultValue `true`
   */
  readonly trailingSlash: boolean;
  /**
   * Reactive route navigation.
   */
  readonly navigation: Reactive<RouteNavigation>;
  /**
   * Whether the router is in the process of navigating to another page.
   */
  readonly navigating: boolean;
  /**
   * Whether the router has started (i.e., loaded first page).
   */
  readonly started: boolean;
  /**
   * The currently loaded route.
   */
  readonly currentRoute: LoadedRoute | null;
  /**
   * Start the router and begin listening for link clicks we can intercept them and handle SPA
   * navigation.
   */
  start(): void;
  /**
   * Called when navigating to a new route and right before a new page is loaded. Returning a
   * redirect path will navigate to the matching route declaration.
   *
   * @defaultValue undefined
   */
  beforeNavigate(hook: RouterBeforeNavigateHook): void;
  /**
   * Called after navigating to a new route and it's respective page has loaded.
   *
   * @defaultValue undefined
   */
  afterNavigate(hook: RouterAfterNavigateHook): void;
  /**
   * Redirect from a given pathname to another.
   */
  addRedirect(from: string | URL, to: string | URL): void;
  /**
   * Returns a route declaration given a URL pathname such as `/` or `/getting-started/intro.html`.
   */
  getRoute(pathname: string): WithRouteParams<RouteDeclaration> | null;
  /**
   * Returns whether the given pathname matches any route.
   */
  hasRoute(pathnameOrRoute: string | UserRouteDeclaration): boolean;
  /**
   * Registers a new route given a declaration.
   */
  addRoute(
    route: Omit<UserRouteDeclaration, 'score'> & { score?: number },
  ): void;
  /**
   * Deregisters a route given it's declaration.
   */
  removeRoute(route: RouteDeclaration): void;
  /**
   * Builds and returns a normalized application URL.
   */
  buildURL(pathnameOrURL: string | URL): URL;
  /**
   * Checks whether the given URL belongs to this application.
   */
  owns(url: URL): boolean;
  /**
   * Attempts to find, build, and return a `Route` object given a pathname or URL.
   */
  findRoute(pathnameOrURL: string | URL): MatchedRoute | null;
  /**
   * Navigate to the previous page.
   */
  back(): void;
  /**
   * Attempts to match the given path to a declared route and navigate to it. The path can be a
   * URL pathname (e.g., `/a/path.html`), hash (e.g., `#some-id`), or URL instance
   * (e.g., `new URL(...)`).
   */
  go(path: string | URL, options?: GoToRouteOptions): Promise<void>;
  /**
   * Loads `href` the old-fashioned way, with a full page reload. Returns a `Promise` that never
   * resolves to prevent any subsequent work (e.g., history manipulation).
   */
  goLocation(url: URL): Promise<void>;
  /**
   * Attempts to find a route given a pathname or URL and call it's prefetch handler. This method
   * will throw if no route matches the given pathname.
   */
  prefetch(pathnameOrURL: string | URL): Promise<void>;
  /**
   * Set a new target for delegating scroll tasks to.
   */
  setScrollDelegate<T extends ScrollDelegate>(
    manager: T | ScrollDelegateFactory<T>,
  ): T;
  /**
   * Adds a new route comparator to handle matching, scoring, and sorting routes.
   */
  setRouteComparator(factory: RoutesComparatorFactory): void;
  /**
   * Notifies the router of a hash change.
   */
  hashChanged(hash: string);
  /**
   * Key used to save navigation state in history state object.
   */
  readonly _historyKey: string;
  /**
   * Keeps track of the history index in order to prevent popstate navigation
   * events (if needed).
   */
  _historyIndex: number;
  /**
   * Internal navigation method.
   */
  _navigate(url: URL, options?: NavigationOptions): Promise<void>;
};
