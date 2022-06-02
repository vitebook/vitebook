/**
 * Heavily inspired by:
 * - SvelteKit Router: https://github.com/sveltejs/kit
 * - Vue Router: https://github.com/vuejs/router
 */

import {
  type AppContextMap,
  calcRoutePathScore,
  compareRoutes,
  inBrowser,
  isString,
  matchRoute,
  slash,
  type WithRouteMatch,
} from '../../shared';
import { getContext, ROUTE_CTX_KEY } from '../context';
import { get, writable } from '../stores/store';
import type { ReadableStore } from '../stores/types';
import type {
  GoToRouteOptions,
  LoadedRoute,
  NavigationOptions,
  RedirectRoute,
  Route,
  RouteDeclaration,
  RouteNavigation,
  RouterAfterNavigateHook,
  RouterBeforeNavigateHook,
  RouterOptions,
  RouterScrollBehaviorHook,
  ScoredRouteDeclaration,
  ScrollTarget,
} from './types';

export class Router {
  protected _url!: URL;
  protected _started = false;
  protected _currentRoute: LoadedRoute | null = null;
  protected _routes: ScoredRouteDeclaration[] = [];

  protected readonly _history: History;
  protected readonly _redirects = new Map<string, string>();

  protected _historyIndex: number;
  protected readonly _historyIndexKey = 'vitebook::index';

  protected readonly _scrollKey = 'vitebook:scroll';
  protected readonly _scrollPositions: Record<
    string,
    { top: number; left: number }
  > = {};

  protected readonly _navigation = writable<RouteNavigation>(null);

  /**
   * The DOM node on which routes will be mounted on.
   */
  readonly target: HTMLElement | null;

  /**
   * Application context that's passed to the route handler.
   */
  readonly context: AppContextMap;

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
  readonly baseUrl: string = '/';

  /**
   * Indicates how the browser should scroll when navigating to a new page.
   *
   * @defaultValue `'auto'`
   */
  scrollBehavior?: RouterScrollBehaviorHook;

  _beforeNavigate: RouterBeforeNavigateHook[] = [];

  /**
   * Called when navigating to a new route and right before a new page is loaded. Returning a
   * redirect path will navigate to the matching route declaration.
   *
   * @defaultValue undefined
   */
  beforeNavigate(hook: RouterBeforeNavigateHook) {
    this._beforeNavigate.push(hook);
  }

  _afterNavigate: RouterAfterNavigateHook[] = [];

  /**
   * Called after navigating to a new route and it's respective page has loaded.
   *
   * @defaultValue undefined
   */
  afterNavigate(hook: RouterAfterNavigateHook) {
    this._afterNavigate.push(hook);
  }

  /**
   * The current URL.
   */
  get url() {
    return this._url;
  }

  /**
   * Route navigation store.
   */
  get navigation(): ReadableStore<RouteNavigation> {
    return {
      subscribe: this._navigation.subscribe,
    };
  }

  /**
   * Whether the router is in the process of navigating to another page.
   */
  get navigating() {
    return !!get(this._navigation);
  }

  /**
   * Whether the router has started (i.e., loaded first page).
   */
  get started() {
    return this._started;
  }

  /**
   * The currently loaded route.
   */
  get currentRoute() {
    return this._currentRoute;
  }

  constructor({ target, context, baseUrl, history, routes }: RouterOptions) {
    this.target = target;
    this.context = context;
    this._history = history;
    this.baseUrl = slash(baseUrl);

    routes?.forEach((route) => {
      this.addRoute(route);
    });

    if (!inBrowser) {
      this._url = new URL('http://ssr');
      this._historyIndex = Date.now();
      return;
    }

    // make it possible to reset focus
    document.body.setAttribute('tabindex', '-1');

    this._url = new URL(location.href);

    // Keeping track of the history index in order to prevent popstate navigation events if needed.
    this._historyIndex = this._history.state?.[this._historyIndexKey];

    if (!this._historyIndex) {
      // We use Date.now() as an offset so that cross-document navigations within the app don't
      // result in data loss.
      this._historyIndex = Date.now();

      // create initial history entry, so we can return here
      this._history.replaceState(
        {
          ...this._history.state,
          [this._historyIndexKey]: this._historyIndex,
        },
        '',
        location.href,
      );
    }

    try {
      this._scrollPositions = JSON.parse(sessionStorage[this._scrollKey]);
    } catch {
      // no-op
    }

    // Recover scroll position if we reload the page, or Cmd-Shift-T back to it.
    const scroll = this._scrollPositions[this._historyIndex];
    if (scroll) {
      this._history.scrollRestoration = 'manual';
      window.scrollTo(scroll.left, scroll.top);
    }
  }

  /**
   * Redirect from a given pathname to another.
   */
  addRedirect(from: string | URL, to: string | URL) {
    const fromURL = isString(from) ? this.buildURL(from) : from;
    const toURL = isString(to) ? this.buildURL(to) : to;
    this._redirects.set(fromURL.href, toURL.href);
  }

  /**
   * Returns a route declaration given a URL pathname such as `/` or `/getting-started/intro.html`.
   */
  getRoute(pathname: string) {
    const url = this.buildURL(pathname);
    return matchRoute(url, this._routes);
  }

  /**
   * Returns whether the given pathname matches any route.
   */
  hasRoute(pathnameOrRoute: string | RouteDeclaration) {
    if (!isString(pathnameOrRoute)) {
      return this._routes.some((route) => route === pathnameOrRoute);
    }

    const url = this.buildURL(pathnameOrRoute);
    return !!matchRoute(url, this._routes);
  }

  /**
   * Registers a new route given a declaration.
   */
  addRoute(route: RouteDeclaration) {
    if (!this.hasRoute(route)) {
      this._routes.push({
        ...route,
        score: route.score ?? calcRoutePathScore(route.pathname),
      });

      this._routes = this._routes.sort(compareRoutes);
    }
  }

  /**
   * Deregisters a route given it's declaration.
   */
  removeRoute(route: RouteDeclaration) {
    this._routes = this._routes.filter((r) => r !== route);
  }

  /**
   * Builds and returns an application URL given a pathname.
   */
  buildURL(pathnameOrURL: string | URL) {
    if (!isString(pathnameOrURL)) return new URL(pathnameOrURL);

    return new URL(
      pathnameOrURL,
      pathnameOrURL.startsWith('#')
        ? /(.*?)(#|$)/.exec(location.href)![1]
        : getBaseUri(this.baseUrl),
    );
  }

  /**
   * Checks whether the given URL belongs to this application.
   */
  owns(url: URL) {
    if (import.meta.env.SSR) return true;

    return (
      url.origin === location.origin && url.pathname.startsWith(this.baseUrl)
    );
  }

  /**
   * Attempts to find, build, and return a `Route` object given a pathname or URL.
   */
  findRoute(pathnameOrURL: string | URL): WithRouteMatch<Route> | null {
    const url = isString(pathnameOrURL)
      ? this.buildURL(pathnameOrURL)
      : pathnameOrURL;

    if (this.owns(url)) {
      const route = matchRoute(url, this._routes);

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
   * Navigate to the previous page.
   */
  back() {
    this._history.back();
  }

  /**
   * Attempts to match the given path to a declared route and navigate to it.
   */
  async go(
    pathnameOrURL: string | URL,
    {
      scroll,
      replace = false,
      keepfocus = false,
      state = {},
    }: GoToRouteOptions = {},
  ) {
    const url = this.buildURL(pathnameOrURL);

    if (!this.disabled) {
      return this._navigate(url, {
        scroll,
        keepfocus,
        hash: url.hash,
        replace,
        state,
      });
    }

    await this.goLocation(url);
  }

  /**
   * Loads `href` the old-fashioned way, with a full page reload. Returns a `Promise` that never
   * resolves to prevent any subsequent work (e.g., history manipulation).
   */
  async goLocation(url: URL): Promise<void> {
    location.href = url.href;
    return new Promise(() => {
      /** no-op */
    });
  }

  /**
   * Attempts to find a route given a pathname or URL and call it's prefetch handler. This method
   * will throw if no route matches the given pathname.
   */
  async prefetch(pathnameOrURL: string | URL): Promise<void> {
    const url = this.buildURL(pathnameOrURL);

    let redirecting = this._redirect(url, (url) => this.prefetch(url));
    if (redirecting) return redirecting;

    const route = this.findRoute(url);

    if (!route) {
      throw new Error(
        'Attempted to prefetch a URL that does not belong to this app',
      );
    }

    const redirect = this._buildRedirect(pathnameOrURL, (redirectURL) => {
      redirecting = this.prefetch(redirectURL);
    });

    await route.prefetch?.({
      route,
      url,
      redirect,
    });

    if (redirecting) return redirecting;
  }

  protected _redirect(
    url: URL,
    handle: (url: URL) => Promise<void>,
  ): null | Promise<void> {
    if (!this._redirects.has(url.href)) return null;

    const redirectHref = this._redirects.get(url.href)!;
    const redirectURL = new URL(redirectHref);

    if (this.owns(redirectURL)) {
      return handle(redirectURL);
    } else {
      return this.goLocation(redirectURL);
    }
  }

  protected _buildRedirect(
    from: string | URL,
    handleRedirect: (url: URL) => void | Promise<void>,
  ): RedirectRoute {
    const fromURL = this.buildURL(from);
    return async (pathOrURL) => {
      const redirectURL = this.buildURL(pathOrURL);
      this.addRedirect(fromURL, redirectURL);
      await handleRedirect(redirectURL);
    };
  }

  protected async _navigate(
    url: URL,
    {
      scroll,
      hash,
      accepted,
      blocked,
      state = {},
      keepfocus = false,
      replace = false,
    }: NavigationOptions,
  ): Promise<void> {
    let cancelled = false;
    const cancel = () => {
      this._navigation.set(null);
      if (!cancelled) blocked?.();
      cancelled = true;
    };

    const redirectNavigation = (url: URL) =>
      this._navigate(url, {
        keepfocus,
        replace,
        state,
        accepted,
        blocked: cancel,
      });

    let redirecting = this._redirect(url, redirectNavigation);
    if (redirecting) return redirecting;

    if (!this.owns(url)) {
      cancel();
      return;
    }

    const route = this.findRoute(url);

    if (!route) {
      cancel();
      throw new Error(
        'Attempted to navigate to a URL that does not belong to this app',
      );
    }

    const redirect = this._buildRedirect(url, (redirectURL) => {
      redirecting = redirectNavigation(redirectURL);
    });

    if (this._currentRoute) {
      for (const hook of this._beforeNavigate) {
        hook({
          from: this._currentRoute,
          to: route,
          match: route.match,
          cancel,
          redirect,
        });
      }
    }

    if (cancelled) return;
    if (redirecting) return redirecting;

    this._updateScrollPosition();

    accepted?.();

    this._navigation.set({ from: this._url, to: url });

    const page = await route.loader({ route, redirect });

    if (redirecting) return redirecting;

    if (!page) {
      cancel();
      return;
    }

    const fromRoute = this._currentRoute;
    const toRoute = { ...route, page };
    this._currentRoute = toRoute;

    getContext(this.context, ROUTE_CTX_KEY).__set(toRoute);

    if (inBrowser) {
      // Wait a tick so page is rendered before updating history.
      await new Promise((res) => window.requestAnimationFrame(res));
    }

    const change = replace ? 0 : 1;
    state[this._historyIndexKey] = this._historyIndex += change;
    this._history[replace ? 'replaceState' : 'pushState'](state, '', url);

    if (inBrowser) {
      if (!keepfocus) {
        // Reset page selection and focus.
        // We try to mimic browsers' behaviour as closely as possible by targeting the
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
      await new Promise((res) => window.requestAnimationFrame(res));

      await this._scroll({
        from: fromRoute!,
        to: toRoute,
        scroll,
        hash,
      });
    }

    if (fromRoute) {
      await Promise.all(
        this._afterNavigate.map((hook) =>
          hook({
            from: fromRoute,
            to: toRoute,
            match: route.match,
          }),
        ),
      );
    }

    this._url = url;
    this._started = true;
    this._navigation.set(null);
  }

  protected _updateScrollPosition() {
    if (!inBrowser) return;
    this._scrollPositions[this._historyIndex] = scrollState();
  }

  protected async _scroll({
    scroll,
    hash,
    from,
    to,
  }: { from?: LoadedRoute; to?: LoadedRoute } & Pick<
    NavigationOptions,
    'scroll' | 'hash'
  >) {
    if (!inBrowser) return;

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };

    let scrollTarget: ScrollTarget = null;
    if (scroll) {
      scrollTarget = await scroll({ cancel });
    } else if (from && to && this.scrollBehavior) {
      scrollTarget = await this.scrollBehavior({
        from,
        to,
        cancel,
        savedPosition: this._scrollPositions[this._historyIndex],
      });
    }

    if (cancelled) return;

    const deepLinked = hash
      ? document.getElementById(decodeURI(hash).slice(1))
      : null;

    const scrollTo = (options: ScrollToOptions) => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo(options);
      } else {
        window.scrollTo(options.left ?? 0, options.top ?? 0);
      }
    };

    if (scrollTarget || deepLinked) {
      const el = isString(scrollTarget?.el)
        ? document.querySelector(scrollTarget!.el)
        : scrollTarget?.el ?? deepLinked;

      const docRect = document.documentElement.getBoundingClientRect();
      const elRect = el?.getBoundingClientRect() ?? { top: 0, left: 0 };
      const offsetTop = scrollTarget?.top ?? 0;
      const offsetLeft = scrollTarget?.left ?? 0;
      const behavior = scrollTarget?.behavior ?? 'auto';

      scrollTo({
        left: elRect.left - docRect.left - offsetLeft,
        top: elRect.top - docRect.top - offsetTop,
        behavior,
      });
    } else {
      scrollTo({ top: 0, left: 0 });
    }
  }

  listen() {
    this._history.scrollRestoration = 'manual';

    // Adopted from Nuxt.js
    // Reset scrollRestoration to auto when leaving page, allowing page reload
    // and back-navigation from other pages to use the browser to restore the
    // scrolling position.
    addEventListener('beforeunload', () => {
      this._history.scrollRestoration = 'auto';
    });

    // Setting scrollRestoration to manual again when returning to this page.
    addEventListener('load', () => {
      this._history.scrollRestoration = 'manual';
    });

    const prefetched = new Set();
    const triggerPrefetch = (event: MouseEvent | TouchEvent) => {
      const a = findAnchor(event.target as Node | null);
      if (
        a &&
        a.href &&
        a.hasAttribute('data-prefetch') &&
        !prefetched.has(a.href)
      ) {
        this.prefetch(getHref(a));
        prefetched.add(a.href);
      }
    };

    let mouseMoveTimeout;
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        triggerPrefetch(event);
      }, 30);
    };

    addEventListener('touchstart', triggerPrefetch);
    addEventListener('mousemove', handleMouseMove);

    // Set this flag to distinguish between navigations triggered by clicking a hash link and
    // those triggered by popstate.
    let hashNavigation = false;

    addEventListener('click', (event: MouseEvent) => {
      if (this.disabled) return;

      // Adapted from https://github.com/visionmedia/page.js
      // MIT license https://github.com/visionmedia/page.js#license
      if (event.button || event.which !== 1) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      if (event.defaultPrevented) return;

      const a = findAnchor(event.target as Node | null);
      if (!a || !a.href) return;

      const url = getHref(a);
      const isSvgAEl = a instanceof SVGAElement;

      // Ignore if url does not have origin (e.g. `mailto:`, `tel:`.).
      if (!isSvgAEl && url.origin === 'null') return;

      // Ignore if tag has:
      // 1. 'download' attribute
      // 2. 'rel' attribute includes external
      const rel = (a.getAttribute('rel') || '').split(/\s+/);

      if (a.hasAttribute('download') || rel.includes('external')) return;

      // Ignore if `<a>` has a target.
      if (isSvgAEl ? a.target.baseVal : a.target) return;

      // Check if new URL only differs by hash and use the browser default behavior in that case.
      // This will ensure the `hashchange` event is fired. Removing the hash does a full page
      // navigation in the browser, so make sure a hash is present.
      const [base, hash] = url.href.split('#');

      if (hash !== undefined && base === location.href.split('#')[0]) {
        hashNavigation = true;

        this._updateScrollPosition();

        if (this._currentRoute) {
          getContext(this.context, ROUTE_CTX_KEY).__set({
            ...this.currentRoute!,
            url,
          });
        }

        return;
      }

      this._navigate(url, {
        scroll: a.hasAttribute('data-noscroll') ? () => scrollState() : null,
        replace: url.href === location.href,
        keepfocus: false,
        accepted: () => event.preventDefault(),
        blocked: () => event.preventDefault(),
      });
    });

    addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this._updateScrollPosition();

        try {
          sessionStorage[this._scrollKey] = JSON.stringify(
            this._scrollPositions,
          );
        } catch {
          // no-op
        }
      }
    });

    addEventListener('popstate', (event) => {
      if (!event.state || this.disabled) return;

      // If a popstate-driven navigation is cancelled, we need to counteract it with `history.go`,
      // which means we end up back here.
      if (event.state[this._historyIndexKey] === this._historyIndex) return;

      this._navigate(new URL(location.href), {
        scroll: () => this._scrollPositions[event.state[this._scrollKey]],
        keepfocus: false,
        accepted: () => {
          this._historyIndex = event.state[this._historyIndexKey];
        },
        blocked: () => {
          const delta = this._historyIndex - event.state[this._historyIndexKey];
          this._history.go(delta);
        },
      });
    });

    addEventListener('hashchange', () => {
      // We need to update history if the `hashchange` happened as a result of clicking on a link,
      // otherwise we leave it alone.
      if (hashNavigation) {
        hashNavigation = false;
        this._history.replaceState(
          {
            ...this._history.state,
            [this._historyIndexKey]: ++this._historyIndex,
          },
          '',
          location.href,
        );
      }
    });
  }
}

function scrollState() {
  return {
    top: scrollY,
    left: scrollX,
  };
}

function getHref(node: HTMLAnchorElement | SVGAElement) {
  return node instanceof SVGAElement
    ? new URL(node.href.baseVal, document.baseURI)
    : new URL(node.href);
}

function getBaseUri(baseUrl = '/') {
  return import.meta.env.SSR
    ? `http://ssr${baseUrl}` // protocol/host irrelevant during SSR
    : `${location.protocol}//${location.host}${baseUrl === '/' ? '' : baseUrl}`;
}

function findAnchor(node: Node | null): HTMLAnchorElement | SVGAElement | null {
  while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; // SVG <a> elements have a lowercase name
  return node as HTMLAnchorElement | SVGAElement;
}
