/**
 * Initially inspired by:
 * - SvelteKit Router: https://github.com/sveltejs/kit
 * - Vue Router: https://github.com/vuejs/router
 */

import {
  resolveStaticDataAssetId,
  STATIC_DATA_ASSET_BASE_PATH,
} from 'shared/data';
import {
  findRoute,
  LoadedServerData,
  LoadedStaticData,
  matchAllRoutes,
  matchRoute,
  normalizeURL,
} from 'shared/routing';
import { isFunction, isString } from 'shared/utils/unit';
import { isLinkExternal } from 'shared/utils/url';

import { removeSSRStyles } from '../utils';
import {
  createSimpleComparator,
  type RoutesComparator,
  type RoutesComparatorFactory,
} from './comparators';
import { listen } from './listen';
import type { Reactive } from './reactivity';
import {
  createSimpleScrollDelegate,
  type ScrollDelegate,
  type ScrollDelegateFactory,
} from './scroll-delegate';
import type {
  AfterNavigateHook,
  BeforeNavigateHook,
  ClientRoute,
  ClientRouteDeclaration,
  LoadedClientRoute,
  MatchedClientRoute,
  Navigation,
  NavigationOptions,
  NavigationRedirector,
  RouterGoOptions,
} from './types';

export type RouterOptions = {
  baseUrl: string;
  trailingSlash?: boolean;
  tick: () => void | Promise<void>;
  $route: Reactive<LoadedClientRoute>;
  $navigation: Reactive<Navigation>;
};

let idCount = 0;
let navigationToken = {};
const loading = new Map<string, Promise<LoadedClientRoute>>();

export class Router {
  protected _url: URL;
  protected _listening = false;
  protected _scrollDelegate: ScrollDelegate;
  protected _comparator: RoutesComparator;
  protected _routes: ClientRoute[] = [];
  protected _route: LoadedClientRoute | null = null;
  protected _redirectsMap = new Map<string, string>();

  protected _tick: RouterOptions['tick'];
  protected _$route: RouterOptions['$route'];
  protected _$navigation: RouterOptions['$navigation'];

  protected _beforeNavigate: BeforeNavigateHook[] = [];
  protected _afterNavigate: AfterNavigateHook[] = [];

  /** Key used to save navigation state in this._history state object. */
  _historyKey = 'vbk::index';
  /** Keeps track of the this._history index in order to prevent popstate navigation events. */
  _historyIndex!: number;

  /**
   * The current URL.
   */
  get url() {
    return this._url;
  }
  /**
   * Whether the router is disabled. Disabling the router means the browser will handle all
   * navigation and calling `goto` will be a no-op.
   *
   * @defaultValue `false`
   */
  disabled = false;
  /**
   * The base URL for all routes.
   *
   * @defaultValue `'/'`
   */
  readonly baseUrl: string;
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
  get navigation(): Omit<RouterOptions['$navigation'], 'set'> {
    return this._$navigation;
  }
  /**
   * Whether the router has loaded the first route and started listening for link clicks to handle
   * SPA navigation.
   */
  get listening() {
    return this._listening;
  }
  /**
   * The currently loaded route.
   */
  get currentRoute() {
    return this._route;
  }
  /**
   * Delegate used to handle scroll-related tasks. The default delegate simply saves scroll
   * positions for pages during certain navigation events.
   */
  get scrollDelegate() {
    return this._scrollDelegate;
  }

  constructor(options: RouterOptions) {
    this.baseUrl = options.baseUrl;
    this.trailingSlash = !!options.trailingSlash;
    this._comparator = createSimpleComparator();
    this._scrollDelegate = createSimpleScrollDelegate(this);

    this._tick = options.tick;
    this._$route = options.$route;
    this._$navigation = options.$navigation;

    this._url = new URL(location.href);

    // make it possible to reset focus
    document.body.setAttribute('tabindex', '-1');

    // Keeping track of the this._history index in order to prevent popstate navigation events if needed.
    this._historyIndex = history.state?.[this._historyKey];

    if (!this._historyIndex) {
      // We use Date.now() as an offset so that cross-document navigations within the app don't
      // result in data loss.
      this._historyIndex = Date.now();

      // create initial this._history entry, so we can return here
      history.replaceState(
        {
          ...history.state,
          [this._historyKey]: this._historyIndex,
        },
        '',
        location.href,
      );
    }
  }

  /**
   * Builds and returns a normalized application URL.
   */
  createURL(pathnameOrURL: string | URL): URL {
    const url = !isString(pathnameOrURL)
      ? new URL(pathnameOrURL)
      : new URL(
          pathnameOrURL,
          isLinkExternal(pathnameOrURL, this.baseUrl)
            ? undefined
            : pathnameOrURL.startsWith('#')
            ? /(.*?)(#|$)/.exec(location.href)![1]
            : getBaseUri(this.baseUrl),
        );

    return this.normalizeURL(url);
  }

  /**
   * Checks whether the given URL belongs to this application.
   */
  owns(url: URL): boolean {
    return (
      url.origin === location.origin && url.pathname.startsWith(this.baseUrl)
    );
  }

  /**
   * Returns whether the given pathname matches any page route.
   */
  test(
    pathnameOrURL: string | URL,
    type: ClientRoute['type'] = 'page',
  ): boolean {
    const url = this.createURL(pathnameOrURL);
    return !!findRoute(url, this._routes, type);
  }

  /**
   * Attempts to match a route to the given a pathname or URL and return a `MatchedRoute` object.
   */
  match(
    pathnameOrURL: string | URL,
    type: ClientRoute['type'] = 'page',
  ): MatchedClientRoute | null {
    const url = this.createURL(pathnameOrURL);
    return this.owns(url) ? matchRoute(url, this._routes, type) : null;
  }

  /**
   * Attempts to match all routes to the given pathname or URL and returns their respective
   * `MatchedRoute` object. This will ensure the leaf node is a page.
   */
  matchAll(pathnameOrURL: string | URL): MatchedClientRoute[] {
    const url = this.createURL(pathnameOrURL);
    return this.owns(url) ? matchAllRoutes(url, this._routes) : [];
  }

  /**
   * Registers a new route given a declaration.
   */
  add(declaration: ClientRouteDeclaration): ClientRoute {
    const exists = declaration.id && this.findById(declaration.id);
    if (exists) return exists;

    const route: ClientRoute = {
      id: declaration.id ?? `${idCount++}`,
      ...declaration,
      pattern: new URLPattern({ pathname: declaration.pathname }),
      score: declaration.score ?? this._comparator.score(declaration),
    };

    this._routes.push(route);
    this._routes = this._comparator.sort(this._routes);

    return route;
  }

  /**
   * Quickly adds a batch of predefined routes.
   */
  addAll(routes: ClientRoute[]) {
    this._routes.push(...routes);
    this._routes = this._comparator.sort(this._routes);
  }

  /**
   * Deregisters a route given it's id.
   */
  remove(id: string | symbol): void {
    this._routes = this._routes.filter((r) => r.id !== id);
  }

  /**
   * Attempts to find and return a registered route given a route id.
   */
  findById(id: string | symbol) {
    return this._routes.find((route) => route.id === id);
  }

  /**
   * Navigate to the previous page.
   */
  back(): void {
    return history.back();
  }

  /**
   * Attempts to match the given path to a declared route and navigate to it. The path can be a
   * URL pathname (e.g., `/a/path.html`), hash (e.g., `#some-id`), or URL instance
   * (e.g., `new URL(...)`).
   */
  async go(
    path: string | URL,
    {
      scroll,
      replace = false,
      keepfocus = false,
      state = {},
    }: RouterGoOptions = {},
  ): Promise<void> {
    if (isString(path) && path.startsWith('#')) {
      const hash = path;
      this.hashChanged(hash);
      this._changeHistoryState(this._url, state, replace);
      await this._scrollDelegate.scroll?.({ target: scroll, hash });
      this._scrollDelegate.savePosition?.();
      return;
    }

    const url = this.createURL(path);

    if (!this.disabled) {
      return this._navigate(url, {
        scroll,
        keepfocus,
        replace,
        state,
      });
    }

    await this.goLocation(url);
  }

  /**
   * Loads `href` the old-fashioned way, with a full page reload. Returns a `Promise` that never
   * resolves to prevent any subsequent work (e.g., this._history manipulation).
   */
  goLocation(url: URL): Promise<void> {
    location.href = url.href;
    return new Promise(() => {
      /** no-op */
    });
  }

  /**
   * Add a redirect from a given pathname to another.
   */
  addRedirect(from: string | URL, to: string | URL): void {
    this._redirectsMap.set(this.createURL(from).href, this.createURL(to).href);
  }

  /**
   * Attempts to find a route given a pathname or URL and call it's prefetch handler. This method
   * will throw if no route matches the given pathname.
   */
  async prefetch(pathnameOrURL: string | URL): Promise<void> {
    const url = this.createURL(pathnameOrURL);

    const redirecting = this._redirectCheck(url, (to) => this.prefetch(to));
    if (redirecting) return redirecting;

    const matches = this.matchAll(url);

    if (matches.length === 0) {
      if (import.meta.env.DEV) {
        console.warn(
          `[vitebook] attempted to prefetch a URL that does not belong to this app: \`${url.href}\``,
        );
      }
      return;
    }

    await this._loadRoute(url, matches);
  }

  /**
   * Normalize trailing slashes.
   */
  normalizeURL(url: URL) {
    return normalizeURL(url, this.trailingSlash);
  }

  /**
   * Start the router and begin listening for link clicks we can intercept them and handle SPA
   * navigation. This has no effect after initial call.
   */
  async start(
    mount: (target: HTMLElement) => void | Promise<void>,
  ): Promise<void> {
    if (!this._listening) {
      await this.go(location.href, { replace: true });
      const target = document.getElementById('app')!;
      await mount(target);
      removeSSRStyles();
      listen(this);
      this._listening = true;
    }
  }

  /**
   * Called when navigating to a new route and right before a new page is loaded. Returning a
   * redirect path will navigate to the matching route declaration.
   *
   * @defaultValue undefined
   */
  beforeNavigate(hook: BeforeNavigateHook): void {
    this._beforeNavigate.push(hook);
  }

  /**
   * Called after navigating to a new route and it's respective page has loaded.
   *
   * @defaultValue undefined
   */
  afterNavigate(hook: AfterNavigateHook): void {
    this._afterNavigate.push(hook);
  }

  /**
   * Set a new delegate for handling scroll-related tasks.
   */
  setScrollDelegate<T extends ScrollDelegate>(
    manager: T | ScrollDelegateFactory<T>,
  ): T {
    return (this._scrollDelegate = isFunction(manager)
      ? manager?.(this)
      : manager);
  }

  /**
   * Adds a new route comparator to handle matching, scoring, and sorting routes.
   */
  setRouteComparator(factory: RoutesComparatorFactory): void {
    this._comparator = factory() ?? createSimpleComparator();
  }

  /**
   * Notifies the router of a hash change.
   */
  hashChanged(hash: string) {
    this._url.hash = hash;
    if (this._route) {
      this._$route?.set({
        ...this._route!,
        url: this._url,
      });
    }
  }

  /** @internal */
  async _navigate(
    url: URL,
    {
      scroll,
      accepted,
      blocked,
      state = {},
      keepfocus = false,
      replace = false,
      redirects = [],
    }: NavigationOptions,
  ) {
    const token = (navigationToken = {});

    let cancelled = false;
    const cancel = () => {
      this._$navigation.set(null);
      if (!cancelled) blocked?.();
      cancelled = true;
    };

    // TODO: check for redirect loop here?? -> load first matching error page?

    const handleRedirect = (to: URL) => {
      if (import.meta.env.DEV) {
        console.info(
          `[vitebook] redirecting from \`${url.href}\` to \`${to.href}\``,
        );
      }

      redirects.push(to.pathname);
      return this._navigate(to, {
        keepfocus,
        replace,
        state,
        accepted,
        blocked: cancel,
        redirects,
      });
    };

    let redirecting = this._redirectCheck(url, handleRedirect);
    if (redirecting) return redirecting;

    if (!this.owns(url)) {
      cancel();
      if (import.meta.env.DEV) {
        console.warn(
          `[vitebook] attempted to navigate to a URL that does not belong to this app: \`${url.href}\``,
        );
      }
      return;
    }

    // Abort if user navigated during micotick.
    await Promise.resolve();
    if (token !== navigationToken) return;

    const matches = this.matchAll(url);
    const leaf = matches[matches.length - 1];
    const isLeafPage = leaf && leaf.type === 'page';

    console.log(matches);

    if (!isLeafPage) {
      cancel();

      if (leaf?.type === 'error') {
        // load it and pass in 404 http error??
      }

      // Happens in SPA fallback mode - don't go back to the server to prevent infinite reload.
      if (
        url.origin === location.origin &&
        url.pathname === location.pathname
      ) {
        // TODO: this should be 404 -> root error page?
      }

      // Let the server decide what to do.
      // await this.goLocation(url);
      return;
    }

    const redirect = this._createRedirector(url, (redirectURL) => {
      redirecting = handleRedirect(redirectURL);
    });

    for (const hook of this._beforeNavigate) {
      await hook({ from: this._route, to: leaf, cancel, redirect });
    }

    if (cancelled) return;
    if (redirecting) return redirecting;

    this.scrollDelegate.savePosition?.();
    this._$navigation.set({ from: url, to: url });
    accepted?.();

    const from = this._route;

    // TODO: this can return a possible redirect (prob need LoadRouteResult)
    // TODO: this can return a bad result 400? - should it return error?
    const to = await this._loadRoute(url, matches);

    this._route = to;
    this._$route?.set(to);

    // Wait a tick so page is rendered before updating history.
    await this._tick();

    this._changeHistoryState(to.url, state, replace);

    if (!keepfocus) {
      // Reset page selection and focus.
      // We try to mimic browsers' behaviur as closely as possible by targeting the
      // first scrollable region, but unfortunately it's not a perfect match — e.g.
      // shift-tabbing won't immediately cycle up from the end of the page on Chromium
      // See https://html.spec.whatwg.org/multipage/interaction.html#get-the-focusable-area
      const root = document.body;
      const tabindex = root.getAttribute('tabindex');
      getSelection()?.removeAllRanges();
      root.tabIndex = -1;
      root.focus({ preventScroll: true });
      // restore `tabindex` as to prevent `root` from stealing input from elements
      if (tabindex !== null) {
        root.setAttribute('tabindex', tabindex);
      } else {
        root.removeAttribute('tabindex');
      }
    }

    // Need to render the DOM before we can scroll to the rendered elements.
    await this._tick();
    await this.scrollDelegate.scroll?.({
      from,
      to,
      target: scroll,
      hash: to.url.hash,
    });

    this._url = url;
    this._$navigation.set(null);

    for (const hook of this._afterNavigate) {
      await hook({ from, to });
    }
  }

  protected async _loadRoute(
    url: URL,
    branch: MatchedClientRoute[],
  ): Promise<LoadedClientRoute> {
    const leaf = branch[branch.length - 1]!;

    const id = leaf.id + branch.length;
    if (loading.has(id)) return loading.get(id)!;

    let resolve!: (route: LoadedClientRoute) => void;
    const promise = new Promise<LoadedClientRoute>((res) => (resolve = res));
    loading.set(id, promise);

    const loadedRoutes = await Promise.all(
      branch.map(async (route) => {
        const [mod, staticData, serverData] = await Promise.all([
          route.loader(),
          loadStaticData(url, route),
          loadServerData(url, route),
        ]);
        return {
          ...route,
          staticData,
          serverData,
          module: mod,
        };
      }),
    );

    // we need to load static data (redirect?) + server data () + modules all at the same time.

    // [LoadStaticDataResult, LoadServerDataResult, LoadedClientRoute]

    // readonly staticData?: JSONData;
    // readonly serverData?: JSONData;
    // readonly error?: Error | ClientHttpError | null;

    // process results -> look for static redirects first, then server redirects
    // look for any unexpected errors (not HTTP) for both static/server
    // if any error -> handle from specific route
    // group everything

    const result: LoadedClientRoute = {
      ...loadedRoutes.pop()!,
      branch: loadedRoutes,
    };

    resolve(result);
    loading.delete(id);
    return result;
  }

  protected _createRedirector(
    from: URL,
    handle: (url: URL) => void | Promise<void>,
  ): NavigationRedirector {
    const fromURL = this.createURL(from);
    return async (pathnameOrURL) => {
      const redirectURL = this.createURL(pathnameOrURL);
      this.addRedirect(fromURL, redirectURL);
      await handle(redirectURL);
    };
  }

  protected _redirectCheck(
    url: URL,
    handle: (to: URL) => void | null | Promise<void>,
  ): void | null | Promise<void> {
    const href = this.normalizeURL(url).href;

    if (!this._redirectsMap.has(href)) return;

    const redirectHref = this._redirectsMap.get(href)!;
    const redirectURL = new URL(redirectHref);

    return this.owns(url) ? handle(redirectURL) : this.goLocation(url);
  }

  protected _changeHistoryState = (url: URL, state: any, replace: boolean) => {
    const change = replace ? 0 : 1;
    state[this._historyKey] = this._historyIndex += change;
    history[replace ? 'replaceState' : 'pushState'](state, '', url);
  };
}

function getBaseUri(baseUrl = '/') {
  return `${location.protocol}//${location.host}${
    baseUrl === '/' ? '' : baseUrl
  }`;
}

type LoadStaticDataResult = {
  data?: LoadedStaticData;
  redirect?: string;
};

let initStaticData = true;
async function loadStaticData(
  url: URL,
  route: MatchedClientRoute,
): Promise<void | LoadStaticDataResult> {
  if (!isString(route.id)) return;

  let pathname = url.pathname;
  if (!pathname.endsWith('/')) pathname += '/';

  const id = resolveStaticDataAssetId(route.id, pathname),
    dataAssetId = import.meta.env.PROD
      ? window['__VBK_STATIC_DATA_HASH_MAP__'][await hashStaticDataAssetId(id)]
      : id;

  if (!dataAssetId) return;

  if (initStaticData) {
    initStaticData = false;
    return { data: getStaticDataFromScript(dataAssetId) };
  }

  try {
    if (import.meta.env.DEV) {
      const queryParams = `?id=${encodeURIComponent(
        route.id,
      )}&pathname=${encodeURIComponent(pathname)}`;

      const response = await fetch(
        `${STATIC_DATA_ASSET_BASE_PATH}/${route.id}.json${queryParams}`,
      );

      const redirect = response.headers.get('X-Vitebook-Redirect');
      if (redirect) return { redirect };

      return { data: await response.json() };
    } else {
      const response = await fetch(
        `${STATIC_DATA_ASSET_BASE_PATH}/${dataAssetId}.json`,
      );

      return { data: await response.json() };
    }
  } catch (e) {
    // TODO: handle this with error boundaries?
    if (import.meta.env.DEV) console.error(e);
  }
}

export type LoadServerDataResult = {
  redirect?: string;
  data?: LoadedServerData;
  error?: LoadedClientRoute['loadError'];
};

async function loadServerData(
  url: URL,
  route: MatchedClientRoute,
): Promise<void | LoadServerDataResult> {
  if (import.meta.env.PROD && !route.canFetch) return;

  // fetchable? + error? + redirect?
  // qparam => ?__data

  return {};
}

function getStaticDataFromScript(id: string) {
  return window['__VBK_STATIC_DATA__']?.[id] ?? {};
}

// Used in production to hash data id.
async function hashStaticDataAssetId(id: string) {
  const encodedText = new TextEncoder().encode(id);
  const hashBuffer = await crypto.subtle.digest('SHA-1', encodedText);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 8);
}
