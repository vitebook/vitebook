/**
 * Inspired by:
 * - SvelteKit Router: https://github.com/sveltejs/kit
 * - Vue Router: https://github.com/vuejs/router
 */

import { normalizeURL } from 'shared/routing';
import { isFunction, isString } from 'shared/utils/unit';
import { slash } from 'shared/utils/url';

import { removeSSRStyles, tick } from '../utils';
import {
  createSimpleRoutesComparator,
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
  $route: Reactive<LoadedClientRoute>;
  $navigation: Reactive<Navigation>;
};

export class Router {
  protected _url: URL;
  protected _listening = false;
  protected _scrollDelegate: ScrollDelegate;
  protected _comparator: RoutesComparator;
  protected _routes: ClientRoute[] = [];
  protected _redirectsMap = new Map<string, string>();

  protected _current: LoadedClientRoute | null = null;

  protected _$route: RouterOptions['$route'];
  protected _$navigation: RouterOptions['$navigation'];

  protected _beforeNavigate: BeforeNavigateHook[] = [];
  protected _afterNavigate: AfterNavigateHook[] = [];

  /** Key used to save navigation state in this._history state object. */
  _historyKey = 'vbk::index';
  /** Keeps track of the this._history index in order to prevent popstate navigation events. */
  _historyIndex!: number;

  protected get _pages() {
    return this._routes.filter((route) => !route.layout && !route.error);
  }

  protected get _layouts() {
    return this._routes.filter((route) => route.layout);
  }

  protected get _errors() {
    return this._routes.filter((route) => route.error);
  }

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
    return this._current;
  }
  /**
   * Delegate used to handle scroll-related tasks. The default delegate simply saves scroll
   * positions for pages during certain navigation events.
   */
  get scrollDelegate() {
    return this._scrollDelegate;
  }

  constructor(options: RouterOptions) {
    this._$route = options.$route;
    this._$navigation = options.$navigation;
    this._comparator = createSimpleRoutesComparator();

    this.baseUrl = options.baseUrl;
    this.trailingSlash = !!options.trailingSlash;
    this._scrollDelegate = createSimpleScrollDelegate(this);

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
          pathnameOrURL.startsWith('#')
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
   * Returns whether the given pathname matches any route.
   */
  test(pathnameOrURL: string | URL): boolean {
    const url = this.createURL(pathnameOrURL);
    return this._comparator.match(url, this._pages) !== null;
  }

  /**
   * Attempts to match route to given a pathname or URL and return a `MatchedRoute` object.
   */
  match(pathnameOrURL: string | URL): MatchedClientRoute | null {
    const url = this.createURL(pathnameOrURL);

    if (this.owns(url)) {
      const route = this._comparator.match(url, this._pages);
      if (!route) return null;
      const pathname = decodeURI(
        slash(url.pathname.slice(this.baseUrl.length)),
      );
      const query = new URLSearchParams(url.search);
      const id = `${pathname}?${query}`;
      return { ...route, id, url };
    }

    return null;
  }

  /**
   * Registers a new route given a declaration.
   */
  add(route: ClientRouteDeclaration): ClientRoute {
    const exists = route.id && this._routes.find((r) => r.id === route.id);
    if (exists) return exists;

    const normalized: ClientRoute = {
      id: route.id ?? Symbol(),
      ...route,
      pattern: new URLPattern({ pathname: route.pathname }),
      score: route.score ?? this._comparator.score(route),
    };

    this._routes.push(normalized);
    this._routes = this._comparator.sort(this._routes);

    return normalized;
  }

  /**
   * @internal Quickly adds a batch of predefined routes.
   */
  _addAll(routes: ClientRoute[]) {
    for (const route of routes) this._routes.push(route);
  }

  /**
   * Deregisters a route given it's id.
   */
  remove(id: string | symbol): void {
    this._routes = this._routes.filter((r) => r.id !== id);
  }

  /**
   * Attempts to find a registered route given a route `id`.
   */
  findById(id: string | symbol): ClientRoute | undefined {
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
    const fromURL = this.normalizeURL(
      isString(from) ? this.createURL(from) : from,
    );
    const toURL = this.normalizeURL(isString(to) ? this.createURL(to) : to);
    this._redirectsMap.set(fromURL.href, toURL.href);
  }

  /**
   * Attempts to find a route given a pathname or URL and call it's prefetch handler. This method
   * will throw if no route matches the given pathname.
   */
  async prefetch(pathnameOrURL: string | URL): Promise<void> {
    const url = this.createURL(pathnameOrURL);

    const redirecting = this._redirectCheck(url, (to) => this.prefetch(to));
    if (redirecting) return redirecting;

    const route = this.match(url);

    if (!route) {
      throw new Error(
        'Attempted to prefetch a URL that does not belong to this app',
      );
    }

    await route.prefetch?.({ route, url });
    // TODO: LOAD ROUTE
  }

  normalizeURL(url: URL) {
    return normalizeURL(url, this.trailingSlash);
  }

  /**
   * Start the router and begin listening for link clicks we can intercept them and handle SPA
   * navigation.
   */
  async start(mount: () => void | Promise<void>): Promise<void> {
    if (!this._listening) {
      await mount();
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
    this._comparator = factory() ?? createSimpleRoutesComparator();
  }

  /**
   * Notifies the router of a hash change.
   */
  hashChanged(hash: string) {
    this._url.hash = hash;
    if (this._current) {
      this._$route?.set({
        ...this._current!,
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
    let cancelled = false;
    const cancel = () => {
      this._$navigation.set(null);
      if (!cancelled) blocked?.();
      cancelled = true;
    };

    // TODO: check for redirect loop here?? -> load first matching error page?

    const handleRedirect = (url: URL) => {
      redirects.push(url.pathname);
      return this._navigate(url, {
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
      return;
    }

    const route = this.match(url);

    if (!route) {
      cancel();
      throw new Error(
        'Attempted to navigate to a URL that does not belong to this app',
      );
    }

    const redirect = this._createRedirector(url, (redirectURL) => {
      redirecting = handleRedirect(redirectURL);
    });

    for (const hook of this._beforeNavigate) {
      hook({ from: this._current, to: route, cancel, redirect });
    }

    if (cancelled) return;
    if (redirecting) return redirecting;

    this.scrollDelegate.savePosition?.();
    this._$navigation.set({ from: url, to: url });
    accepted?.();

    // match layouts in the correct order -> load layouts+page
    // LOAD LAYOUTS -MOD + STATIC LOAD + SERVER LOAD (LOAD_ROUTE(...))
    const mod = await route.loader({ url, route });

    // readonly staticData?: JSONData;
    // readonly serverData?: JSONData;
    // readonly error?: Error | ClientHttpError | null;

    if (!mod) {
      cancel();
      return;
    }

    const from = this._current;

    const to: LoadedClientRoute = {
      ...route,
      module: { ...mod },
      layouts: [],
    };

    this._current = to;
    this._$route?.set(to);

    // Wait a tick so page is rendered before updating history.
    await tick();

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
    await tick();

    await this.scrollDelegate.scroll?.({
      from,
      to,
      target: scroll,
      hash: to.url.hash,
    });

    await Promise.all(this._afterNavigate.map((hook) => hook({ from, to })));
    await tick();

    this._url = url;
    this._$navigation.set(null);
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
    handle: (to: URL) => void | Promise<void> | null,
  ): void | Promise<void> | null {
    const href = this.normalizeURL(url).href;

    if (!this._redirectsMap.has(href)) return null;

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

// export async function loadPage(
//   router: Router,
//   clientPage: ClientPage,
//   clientLayouts: ClientLayout[],
//   $currentPage: Reactive<LoadedClientPage>,
//   { prefetch = false }: { prefetch?: boolean | URL } = {},
// ): Promise<string | LoadedClientPage> {
//   const prefetchURL = isBoolean(prefetch) ? undefined : prefetch;

//   let pageModule: ClientPageModule;
//   let pageStaticData: JSONData;
//   let layouts: LoadedClientLayout[];

//   /**
//    * Loading is slightly different during dev because we need to check for a page redirect which
//    * is returned from the `/_immutable/data` endpoint. This is not needed in prod because the
//    * complete redirect table is injected into the rendered HTML.
//    */
//   if (import.meta.env.DEV) {
//     pageModule = await clientPage.loader();

//     pageStaticData = await loadStaticData(
//       router,
//       pageModule,
//       undefined,
//       prefetchURL,
//     );

//     if (import.meta.env.DEV && isString(pageStaticData.__redirect__)) {
//       return pageStaticData.__redirect__;
//     }

//     layouts = await loadPageLayouts(
//       router,
//       clientPage,
//       clientLayouts,
//       prefetchURL,
//     );
//   } else {
//     [pageModule, layouts] = await Promise.all([
//       (async () => {
//         const mod = await clientPage.loader();
//         pageStaticData = await loadStaticData(
//           router,
//           mod,
//           undefined,
//           prefetchURL,
//         );
//         return mod;
//       })(),
//       loadPageLayouts(router, clientPage, clientLayouts, prefetchURL),
//     ]);
//   }

//   const loadedPage: LoadedClientPage = {
//     ...clientPage,
//     $$loaded: true,
//     module: pageModule,
//     layouts,
//     staticData: pageStaticData!,
//     get default() {
//       return pageModule.default;
//     },
//     get meta() {
//       return isLoadedMarkdownPage(this) ? pageModule.meta : undefined;
//     },
//   };

//   if (!prefetch) {
//     $currentPage.set(loadedPage);
//   }

//   return loadedPage;
// }

// export function loadPageLayouts(
//   router: Router,
//   page: ClientPage,
//   layouts: ClientLayout[],
//   prefetchURL?: URL,
// ): Promise<LoadedClientLayout[]> {
//   return Promise.all(
//     page.layouts.map(async (index) => {
//       const layout = layouts[index];
//       const mod = await layout.loader();
//       return {
//         $$loaded: true as const,
//         ...layout,
//         module: mod,
//         staticData: await loadStaticData(router, mod, index, prefetchURL),
//         get default() {
//           return mod.default;
//         },
//       };
//     }),
//   );
// }

// export async function loadStaticData(
//   router: Router,
//   module: ClientPageModule | ClientLayoutModule,
//   layoutIndex?: number,
//   prefetchURL?: URL,
// ): Promise<JSONData> {
//   if (!module.loader) return {};

//   let pathname = prefetchURL?.pathname ?? router.transition.get()!.to.pathname;
//   if (!pathname.endsWith('/')) pathname += '/';

//   const id = resolveStaticDataAssetID(decodeURI(pathname), layoutIndex);

//   const hashId =
//     import.meta.env.PROD && !import.meta.env.SSR
//       ? window['__VBK_STATIC_DATA_HASH_MAP__'][await hashDataId(id)]
//       : id;

//   if (!hashId) return {};

//   if (import.meta.env.SSR && router.serverContext) {
//     return router.serverContext.staticData.get(hashId) ?? {};
//   }

//   try {
//     const json = !router.listening
//       ? getStaticDataFromScript(hashId)
//       : await (
//           await fetch(`${STATIC_DATA_ASSET_BASE_PATH}/${hashId}.json`)
//         ).json();

//     return json;
//   } catch (e) {
//     // TODO: handle this with error boundaries?
//     console.error(e);
//   }

//   return {};
// }

// function getStaticDataFromScript(id: string) {
//   return window['__VBK_STATIC_DATA__']?.[id] ?? {};
// }

// // Used in production to hash data id.
// async function hashDataId(id: string) {
//   const encodedText = new TextEncoder().encode(id);
//   const hashBuffer = await crypto.subtle.digest('SHA-1', encodedText);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   return hashArray
//     .map((b) => b.toString(16).padStart(2, '0'))
//     .join('')
//     .substring(0, 8);
// }
