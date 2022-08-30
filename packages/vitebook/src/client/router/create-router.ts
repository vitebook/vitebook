/**
 * Inspired by:
 * - SvelteKit Router: https://github.com/sveltejs/kit
 * - Vue Router: https://github.com/vuejs/router
 */

import { isFunction, isString, normalizeURL, slash } from '../../shared';
import { createSimpleRoutesComparator } from './comparators/comparator';
import type { RoutesComparator } from './comparators/types';
import { listen } from './listener';
import type { Router } from './Router';
import {
  createSimpleScrollDelegate,
  type ScrollDelegate,
} from './scroll-delegate';
import type {
  LoadedRoute,
  NavigationOptions,
  RouteDeclaration,
  RouterAfterNavigateHook,
  RouterBeforeNavigateHook,
  RouteRedirect,
  RouterOptions,
  ScoredRouteDeclaration,
} from './types';

export function createRouter({
  history,
  baseUrl = '/',
  trailingSlash = true,
  $navigation,
  $route,
  initialRoutes = [],
  serverContext,
}: RouterOptions): Router {
  let _url: URL,
    _started = false,
    _disabled = false,
    _historyIndex = Date.now(),
    _routes: ScoredRouteDeclaration[] = [],
    _currentRoute: LoadedRoute | null = null,
    _scrollDelegate: ScrollDelegate,
    _comparator: RoutesComparator = createSimpleRoutesComparator();

  const _historyKey = 'vitebook::index',
    _redirects = new Map<string, string>(),
    _beforeNavigate: RouterBeforeNavigateHook[] = [],
    _afterNavigate: RouterAfterNavigateHook[] = [];

  if (import.meta.env.SSR) {
    _url = new URL('http://ssr');
  } else {
    _url = new URL(location.href);
    // make it possible to reset focus
    document.body.setAttribute('tabindex', '-1');
  }

  const buildURL: Router['buildURL'] = (pathnameOrURL) => {
    const url = !isString(pathnameOrURL)
      ? new URL(pathnameOrURL)
      : new URL(
          pathnameOrURL,
          pathnameOrURL.startsWith('#')
            ? /(.*?)(#|$)/.exec(location.href)![1]
            : getBaseUri(baseUrl),
        );

    return normalizeURL(url, trailingSlash);
  };

  const owns: Router['owns'] = (url) => {
    if (import.meta.env.SSR) return true;
    return url.origin === location.origin && url.pathname.startsWith(baseUrl);
  };

  const hasRoute: Router['hasRoute'] = (pathnameOrRoute) => {
    const url = buildURL(
      !isString(pathnameOrRoute) ? pathnameOrRoute.pathname : pathnameOrRoute,
    );
    return _comparator.match(url, _routes) !== null;
  };

  const findRoute: Router['findRoute'] = (pathnameOrURL) => {
    const url = isString(pathnameOrURL)
      ? buildURL(pathnameOrURL)
      : pathnameOrURL;

    if (owns(url)) {
      const route = _comparator.match(url, _routes);
      if (!route) return null;
      const pathname = decodeURI(slash(url.pathname.slice(baseUrl.length)));
      const query = new URLSearchParams(url.search);
      const id = `${pathname}?${query}`;
      return { ...route, id, url };
    }

    return null;
  };

  const goLocation: Router['goLocation'] = async (url) => {
    location.href = url.href;
    return new Promise(() => {
      /** no-op */
    });
  };

  function _redirect(
    url: URL,
    handle: (url: URL) => Promise<void>,
  ): null | Promise<void> {
    const href = normalizeURL(url, trailingSlash).href;

    if (!_redirects.has(href)) return null;

    const redirectHref = _redirects.get(href)!;
    const redirectURL = new URL(redirectHref);

    if (owns(redirectURL)) {
      return handle(redirectURL);
    } else {
      return goLocation(redirectURL);
    }
  }

  const addRedirect: Router['addRedirect'] = (from, to) => {
    const fromURL = normalizeURL(
      isString(from) ? buildURL(from) : from,
      trailingSlash,
    );

    const toURL = normalizeURL(isString(to) ? buildURL(to) : to, trailingSlash);

    _redirects.set(fromURL.href, toURL.href);
  };

  function _buildRedirect(
    from: string | URL,
    handleRedirect: (url: URL) => void | Promise<void>,
  ): RouteRedirect {
    const fromURL = buildURL(from);
    return async (pathOrURL) => {
      const redirectURL = buildURL(pathOrURL);
      addRedirect(fromURL, redirectURL);
      await handleRedirect(redirectURL);
    };
  }

  const prefetch: Router['prefetch'] = async (pathnameOrURL) => {
    const url = buildURL(pathnameOrURL);

    let redirecting = _redirect(url, (url) => prefetch(url));
    if (redirecting) return redirecting;

    const route = findRoute(url);

    if (!route) {
      throw new Error(
        'Attempted to prefetch a URL that does not belong to this app',
      );
    }

    const redirect = _buildRedirect(pathnameOrURL, (redirectURL) => {
      redirecting = prefetch(redirectURL);
    });

    await route.prefetch?.({
      route,
      url,
      redirect,
    });

    if (redirecting) return redirecting;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeHistoryState = (url: URL, state: any, replace: boolean) => {
    const change = replace ? 0 : 1;
    state[_historyKey] = _historyIndex += change;
    history[replace ? 'replaceState' : 'pushState'](state, '', url);
  };

  if (!import.meta.env.SSR) {
    // Keeping track of the history index in order to prevent popstate navigation events if needed.
    _historyIndex = history.state?.[_historyKey];

    if (!_historyIndex) {
      // We use Date.now() as an offset so that cross-document navigations within the app don't
      // result in data loss.
      _historyIndex = Date.now();

      // create initial history entry, so we can return here
      history.replaceState(
        {
          ...history.state,
          [_historyKey]: _historyIndex,
        },
        '',
        location.href,
      );
    }
  }

  async function navigate(
    url: URL,
    {
      scroll,
      accepted,
      blocked,
      state = {},
      keepfocus = false,
      replace = false,
    }: NavigationOptions,
  ): Promise<void> {
    let cancelled = false;
    const cancel = () => {
      $navigation.set(null);
      if (!cancelled) blocked?.();
      cancelled = true;
    };

    const redirectNavigation = (url: URL) =>
      navigate(url, {
        keepfocus,
        replace,
        state,
        accepted,
        blocked: cancel,
      });

    let redirecting = _redirect(url, redirectNavigation);
    if (redirecting) return redirecting;

    if (!owns(url)) {
      cancel();
      return;
    }

    const route = findRoute(url);

    if (!route) {
      cancel();
      throw new Error(
        'Attempted to navigate to a URL that does not belong to this app',
      );
    }

    const redirect = _buildRedirect(url, (redirectURL) => {
      redirecting = redirectNavigation(redirectURL);
    });

    for (const hook of _beforeNavigate) {
      hook({
        from: _currentRoute,
        to: route,
        params: route.params,
        cancel,
        redirect,
      });
    }

    if (cancelled) return;
    if (redirecting) return redirecting;

    _scrollDelegate.savePosition?.();

    accepted?.();

    $navigation.set({ from: url, to: url });

    const page = await route.loader({ route, redirect });

    if (redirecting) return redirecting;

    if (!page) {
      cancel();
      return;
    }

    const fromRoute = _currentRoute;
    const toRoute = { ...route, page };
    _currentRoute = toRoute;

    $route?.set(toRoute);

    if (!import.meta.env.SSR) {
      // Wait a tick so page is rendered before updating history.
      await new Promise((res) => window.requestAnimationFrame(res));
    }

    changeHistoryState(url, state, replace);

    if (!import.meta.env.SSR) {
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
      await new Promise((res) => window.requestAnimationFrame(res));

      await _scrollDelegate.scroll?.({
        from: fromRoute,
        to: toRoute,
        target: scroll,
        hash: url.hash,
      });
    }

    await Promise.all(
      _afterNavigate.map((hook) =>
        hook({
          from: fromRoute,
          to: toRoute,
          params: route.params,
        }),
      ),
    );

    _url = url;
    $navigation.set(null);
  }

  const hashChanged = (hash: string) => {
    _url.hash = hash;
    if (_currentRoute) {
      $route?.set({
        ..._currentRoute!,
        url: _url,
      });
    }
  };

  const router: Router = {
    baseUrl,
    trailingSlash,
    serverContext,
    get url() {
      return _url;
    },
    get started() {
      return _started;
    },
    get currentRoute() {
      return _currentRoute;
    },
    get _historyKey() {
      return _historyKey;
    },
    get _historyIndex() {
      return _historyIndex;
    },
    set _historyIndex(index) {
      _historyIndex = index;
    },
    get scroll() {
      return _scrollDelegate;
    },
    get navigation() {
      return $navigation;
    },
    get navigating() {
      return !!$navigation.get();
    },
    get disabled() {
      return _disabled;
    },
    set disabled(disabled) {
      _disabled = disabled;
    },
    buildURL,
    owns,
    hasRoute,
    findRoute,
    goLocation,
    prefetch,
    addRedirect,
    hashChanged,
    _navigate: navigate,
    beforeNavigate(hook) {
      _beforeNavigate.push(hook);
    },
    afterNavigate(hook) {
      _afterNavigate.push(hook);
    },
    start() {
      if (!_started) {
        listen(router, history);
        _started = true;
      }
    },
    getRoute(pathname) {
      const url = buildURL(pathname);
      return _comparator.match(url, _routes);
    },
    addRoute(route) {
      if (!hasRoute(route)) {
        _routes.push({
          ...route,
          score: route.score ?? _comparator.score(route),
        });

        _routes = _comparator.sort(_routes);
      }
    },
    removeRoute(route: RouteDeclaration) {
      _routes = _routes.filter((r) => r !== route);
    },
    back() {
      history.back();
    },
    async go(
      path,
      { scroll, replace = false, keepfocus = false, state = {} } = {},
    ) {
      if (isString(path) && path.startsWith('#')) {
        const hash = path;
        hashChanged(hash);
        changeHistoryState(_url, state, replace);
        await _scrollDelegate.scroll?.({ target: scroll, hash });
        _scrollDelegate.savePosition?.();
        return;
      }

      const url = buildURL(path);

      if (!_disabled) {
        return navigate(url, {
          scroll,
          keepfocus,
          replace,
          state,
        });
      }

      await goLocation(url);
    },
    setScrollDelegate(manager) {
      return (_scrollDelegate = isFunction(manager)
        ? manager?.(router)
        : manager);
    },
    setRouteComparator(factory) {
      _comparator = factory() ?? createSimpleRoutesComparator();
    },
  };

  _scrollDelegate = createSimpleScrollDelegate(router);

  initialRoutes?.forEach((route) => {
    router.addRoute(route);
  });

  return router;
}

function getBaseUri(baseUrl = '/') {
  return import.meta.env.SSR
    ? `http://ssr${baseUrl}` // protocol/host irrelevant during SSR
    : `${location.protocol}//${location.host}${baseUrl === '/' ? '' : baseUrl}`;
}
