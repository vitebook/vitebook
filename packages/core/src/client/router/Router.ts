import {
  ensureLeadingSlash,
  inBrowser,
  isBoolean,
  isString,
} from '../../shared';
import { pages as pagesStore } from '../stores/pages';
import { route as routeStore } from '../stores/route';
import { get } from '../stores/store';
import type {
  GoToRouteOptions,
  LoadedRoute,
  NavigationOptions,
  Route,
  RouteDeclaration,
  RouterAfterNavigateHook,
  RouterBeforeNavigateHook,
  RouterOptions,
  RouterScrollBehaviorHook,
} from './types';

export class Router {
  protected readonly _history: History;
  protected readonly _routes: Map<string, RouteDeclaration> = new Map();

  protected _currentRoute?: LoadedRoute;

  protected _savedScrollPosition?: ScrollToOptions;

  /**
   * The DOM node on which routes will be mounted on.
   */
  readonly target: HTMLElement | null;

  /**
   * Application context that's passed to the route handler.
   */
  readonly context: Map<string, unknown>;

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

  /**
   * Called when navigating to a new route and right before a new page is loaded. Returning a
   * redirect path will navigate to the matching route declaration.
   *
   * @defaultValue undefined
   */
  beforeNavigate?: RouterBeforeNavigateHook;

  /**
   * Called after navigating to a new route and it's respective page has loaded.
   *
   * @defaultValue undefined
   */
  afterNavigate?: RouterAfterNavigateHook;

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
    this.baseUrl = ensureLeadingSlash(baseUrl);

    routes?.forEach((route) => {
      this.addRoute(route);
    });

    if (inBrowser) {
      // make it possible to reset focus
      document.body.setAttribute('tabindex', '-1');

      // create initial history entry, so we can return here
      this._history.replaceState(this._history.state || {}, '', location.href);
    }
  }

  /**
   * Returns a route declaration given a URL pathname such as `/` or `/getting-started/intro.html`.
   */
  getRoute(path: string) {
    return this._routes.get(decodeURI(ensureLeadingSlash(path)));
  }

  /**
   * Returns whether a route has been declared and registered given a URL pathname or a route
   * declaration.
   */
  hasRoute(pathOrRoute: string | RouteDeclaration) {
    const path = ensureLeadingSlash(
      isString(pathOrRoute) ? pathOrRoute : pathOrRoute.path,
    );
    return this._routes.has(decodeURI(path));
  }

  /**
   * Registers a new route given a declaration.
   */
  addRoute(route: RouteDeclaration) {
    route.path = ensureLeadingSlash(route.path);
    this._routes.set(decodeURI(route.path), route);
  }

  /**
   * Deregisters a route given a URL pathname or route declaration.
   */
  removeRoute(pathOrRoute: string | RouteDeclaration) {
    const path = ensureLeadingSlash(
      isString(pathOrRoute) ? pathOrRoute : pathOrRoute.path,
    );
    this._routes.delete(decodeURI(path));
  }

  /**
   * Builds and returns an application URL given a pathname.
   */
  buildURL(path: string) {
    return new URL(
      path,
      path.startsWith('#')
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
  findRoute(pathOrURL: string | URL): Route | undefined {
    const url = isString(pathOrURL) ? this.buildURL(pathOrURL) : pathOrURL;

    if (this.owns(url)) {
      const path = ensureLeadingSlash(
        url.pathname.slice(this.baseUrl.length) || '/',
      );
      const route =
        this._routes.get(decodeURI(path)) ?? this._routes.get('/404.html')!;
      const query = new URLSearchParams(url.search);
      const id = `${path}?${query}`;
      return { ...route, id, url };
    }

    return undefined;
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
    path: string,
    {
      scroll = undefined,
      replace = false,
      keepfocus = false,
      state = {},
    }: GoToRouteOptions = {},
  ) {
    const url = this.buildURL(path);

    if (!this.disabled && this.owns(url)) {
      this._history[replace ? 'replaceState' : 'pushState'](state, '', path);

      await this._navigate({
        url,
        scroll,
        keepfocus,
        hash: url.hash,
      });

      return;
    }

    location.href = url.href;
    return Promise.resolve();
  }

  /**
   * Attempts to find a route given a pathname or URL and call it's prefetch handler.
   */
  async prefetch(pathOrURL: string | URL): Promise<void> {
    const route = this.findRoute(pathOrURL);

    if (route?.redirect) {
      await this.prefetch(this.buildURL(route?.redirect));
      return;
    }

    if (!route) {
      throw new Error(
        'Attempted to prefetch a URL that does not belong to this app',
      );
    }

    await route.prefetch?.(route);
  }

  protected async _navigate({
    url,
    keepfocus,
    scroll,
    hash,
  }: NavigationOptions) {
    const route = this.findRoute(url);

    if (route?.redirect) {
      await this.go(route.redirect, { replace: true });
      return;
    }

    if (!route) {
      throw new Error(
        'Attempted to navigate to a URL that does not belong to this app',
      );
    }

    const beforeNavigate = this._currentRoute
      ? await this.beforeNavigate?.(this._currentRoute, route)
      : undefined;

    if (isBoolean(beforeNavigate) && !beforeNavigate) return;

    if (beforeNavigate?.redirect) {
      await this.go(beforeNavigate.redirect, { replace: true });
      return;
    }

    const page = await route.loader(route);

    if (!get(pagesStore).find((page) => page.route === route.url.pathname)) {
      await this.go('/404.html');
      return;
    }

    const fromRoute = this._currentRoute;
    const toRoute = { ...route, page };

    this._currentRoute = toRoute;
    routeStore.__set(toRoute);

    if (inBrowser) {
      await new Promise((res) => window.requestAnimationFrame(res));

      if (!keepfocus) {
        document.body.focus();
      }

      if (scroll !== false) {
        await this._scrollToPosition({
          from: fromRoute,
          to: toRoute,
          scroll,
          hash,
        });
      }
    }

    if (fromRoute) {
      await this.afterNavigate?.(fromRoute, toRoute);
    }
  }

  protected async _scrollToPosition({
    scroll,
    hash,
    from,
    to,
  }: { from?: LoadedRoute; to?: LoadedRoute } & Pick<
    NavigationOptions,
    'scroll' | 'hash'
  >) {
    if (!inBrowser) return;

    const scrollToOptions =
      scroll !== false && from && to && this.scrollBehavior
        ? await this.scrollBehavior(from, to, this._savedScrollPosition)
        : scroll;

    if (scrollToOptions === false) return;

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

    await new Promise((res) => window.requestAnimationFrame(res));

    if (scrollToOptions || deepLinked) {
      const el = isString(scrollToOptions?.el)
        ? document.querySelector(scrollToOptions!.el)
        : scrollToOptions?.el ?? deepLinked;

      const docRect = document.documentElement.getBoundingClientRect();
      const elRect = el?.getBoundingClientRect() ?? { top: 0, left: 0 };
      const offsetTop = scrollToOptions?.top ?? 0;
      const offsetLeft = scrollToOptions?.left ?? 0;
      const behavior = scrollToOptions?.behavior ?? 'auto';

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
    if ('scrollRestoration' in this._history) {
      this._history.scrollRestoration = 'manual';
    }

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

    // There's no API to capture the scroll location right before the user
    // hits the back/forward button, so we listen for scroll events

    let scrollTimer;
    addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // Store the scroll location in the history
        // This will persist even if we navigate away from the site and come back
        const newState = {
          ...(this._history.state || {}),
          'vitebook:scroll': scrollState(),
        };

        this._history.replaceState(
          newState,
          document.title,
          window.location.href,
        );
      }, 50);
    });

    const prefetched = new Set();
    const triggerPrefetch = (event: MouseEvent | TouchEvent) => {
      const a = findAnchor(event.target as Node | null);
      const href = a && a.href ? getHref(a) : '';

      if (
        !a ||
        !a.href ||
        prefetched.has(href) ||
        !href.startsWith(getBaseUri(this.baseUrl)) ||
        !this.hasRoute(getHrefURL(a).pathname)
      ) {
        return;
      }

      this.prefetch(getHrefURL(a));
      prefetched.add(href);
    };

    let mouseMoveTimeout;
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        triggerPrefetch(event);
      }, 20);
    };

    addEventListener('touchstart', triggerPrefetch);
    addEventListener('mousemove', handleMouseMove);

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

      const url = getHrefURL(a);
      const urlString = url.toString();

      if (urlString === location.href) {
        event.preventDefault();

        if (location.hash) {
          this._scrollToPosition({ hash: location.hash });
        }

        return;
      }

      // Ignore if tag has
      // 1. 'download' attribute
      // 2. 'rel' attribute includes external
      const rel = (a.getAttribute('rel') || '').split(/\s+/);

      if (a.hasAttribute('download') || (rel && rel.includes('external'))) {
        return;
      }

      // Ignore if <a> has a target
      if (a instanceof SVGAElement ? a.target.baseVal : a.target) return;

      if (!this.owns(url)) return;

      const i1 = urlString.indexOf('#');
      const i2 = location.href.indexOf('#');
      const u1 = i1 >= 0 ? urlString.substring(0, i1) : urlString;
      const u2 = i2 >= 0 ? location.href.substring(0, i2) : location.href;

      if (u1 === u2) {
        this.go(decodeURI(url.hash), { replace: true });
        return;
      }

      this.go(url.href);

      event.preventDefault();
    });

    addEventListener('popstate', (event) => {
      if (event.state && !this.disabled) {
        const url = new URL(location.href);
        this._savedScrollPosition = event.state['vitebook:scroll'];
        this._navigate({
          url,
          scroll: this._savedScrollPosition,
        });
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

function findAnchor(node: Node | null): HTMLAnchorElement | SVGAElement | null {
  while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; // SVG <a> elements have a lowercase name
  return node as HTMLAnchorElement | SVGAElement;
}

function getHref(node: HTMLAnchorElement | SVGAElement): string {
  return node instanceof SVGAElement ? node.href.baseVal : node.href;
}

function getHrefURL(node: HTMLAnchorElement | SVGAElement): URL {
  return node instanceof SVGAElement
    ? new URL(node.href.baseVal, document.baseURI)
    : new URL(node.href);
}

function getBaseUri(baseUrl = '/') {
  return import.meta.env.SSR
    ? `https://ssr.com${baseUrl}` // protocol/host irrelevant during SSR
    : `${location.protocol}//${location.host}${baseUrl === '/' ? '' : baseUrl}`;
}
