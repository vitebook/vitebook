import { ensureLeadingSlash, inBrowser, isString } from '@vitebook/core';
import { tick } from 'svelte';
import { noop, raf } from 'svelte/internal';
import { get } from 'svelte/store';

import type { SvelteModule } from '../../shared';
import { currentPage } from '../stores/currentPage';
import { currentRoute } from '../stores/currentRoute';
import { pages } from '../stores/pages';
import type {
  GoToRouteOptions,
  NavigationOptions,
  Route,
  RouteLocation,
  RouterOptions,
} from './types';

/**
 * Adapted from https://github.com/sveltejs/kit/blob/master/packages/kit/src/runtime/client/router.js
 */
export class Router {
  protected readonly history: History;
  protected readonly routes: Map<string, Route> = new Map();

  enabled = true;
  baseUrl = '/';
  scrollBehaviour?: ScrollBehavior = 'auto';
  scrollOffset = () => ({ top: 0, left: 0 });
  beforeNavigate?: (url: URL) => void | Promise<void>;
  afterNavigate?: (url: URL) => void | Promise<void>;

  protected _isReady = false;
  protected _resolveReadyPromise?: () => void;
  protected _isReadyPromise = new Promise(
    (res) =>
      (this._resolveReadyPromise = () => {
        res(void 0);
        this._isReady = true;
      }),
  );

  get isReady() {
    return this._isReady;
  }

  get waitUntilReady() {
    return this._isReadyPromise;
  }

  constructor({ baseUrl, history, routes }: RouterOptions) {
    this.baseUrl = baseUrl;
    this.history = history;

    routes?.forEach((route) => {
      this.addRoute(route);
    });

    if (inBrowser) {
      // make it possible to reset focus
      document.body.setAttribute('tabindex', '-1');

      // create initial history entry, so we can return here
      this.history.replaceState(this.history.state || {}, '', location.href);
    }
  }

  hasRoute(path: string) {
    return this.routes.has(decodeURI(path));
  }

  addRoute(route: Route) {
    this.routes.set(decodeURI(route.path), route);
  }

  removeRoute(route: string | Route) {
    this.routes.delete(decodeURI(isString(route) ? route : route.path));
  }

  owns(url: URL) {
    if (import.meta.env.SSR) return true;
    return (
      url.origin === location.origin && url.pathname.startsWith(this.baseUrl)
    );
  }

  parse(url: URL): RouteLocation | undefined {
    if (this.owns(url)) {
      const path = ensureLeadingSlash(
        url.pathname.slice(this.baseUrl.length) || '/',
      );
      const decodedPath = decodeURI(path);
      const route =
        this.routes.get(decodedPath) ?? this.routes.get('/404.html')!;

      const query = new URLSearchParams(url.search);
      const id = `${path}?${query}`;
      return { id, route, path, query, hash: url.hash, decodedPath };
    }

    return undefined;
  }

  back() {
    this.history.back();
  }

  async go(
    href,
    {
      scroll = undefined,
      replace = false,
      keepfocus = false,
      state = {},
    }: GoToRouteOptions = {},
  ) {
    const url = new URL(
      href,
      href.startsWith('#')
        ? /(.*?)(#|$)/.exec(location.href)![1]
        : getBaseUri(this.baseUrl),
    );

    await this.beforeNavigate?.(url);

    if (this.enabled && this.owns(url)) {
      this.history[replace ? 'replaceState' : 'pushState'](state, '', href);

      await this.navigate({
        url,
        scroll,
        keepfocus,
        hash: url.hash,
      });

      if (this._resolveReadyPromise) {
        this._resolveReadyPromise();
        this._resolveReadyPromise = undefined;
      }

      return;
    }

    location.href = url.href;
    return new Promise(() => {
      /* never resolves */
    });
  }

  async prefetch(url: URL): Promise<void> {
    const routeLocation = this.parse(url);

    if (routeLocation?.route.redirect) {
      await this.prefetch(
        new URL(routeLocation.route.redirect, getBaseUri(this.baseUrl)),
      );
      return;
    }

    if (!routeLocation) {
      throw new Error(
        'Attempted to prefetch a URL that does not belong to this app',
      );
    }

    await routeLocation.route.prefetch?.(routeLocation);
  }

  protected async navigate({
    url,
    keepfocus,
    scroll,
    hash,
  }: NavigationOptions) {
    const routeLocation = this.parse(url);

    if (routeLocation?.route.redirect) {
      // TODO: this doesn't forward hash or query string
      await this.go(routeLocation.route.redirect, { replace: true });
      return;
    }

    if (!routeLocation) {
      throw new Error(
        'Attempted to navigate to a URL that does not belong to this app',
      );
    }

    const component = await routeLocation.route.loader(routeLocation);

    if (!get(pages).find((page) => page.route === routeLocation.path)) {
      currentPage.__set(undefined);
    }

    currentRoute.__set({
      ...routeLocation,
      component: (component as SvelteModule).default ?? component,
    });

    await tick();

    if (inBrowser) {
      if (!keepfocus) {
        document.body.focus();
      }

      if (scroll !== false) {
        await this.scrollToPosition({ scroll, hash });
      }
    }

    await this.afterNavigate?.(url);
  }

  protected async scrollToPosition({
    scroll,
    hash,
  }: Pick<NavigationOptions, 'scroll' | 'hash'>) {
    if (!inBrowser) return;

    const deepLinked =
      hash && document.getElementById(decodeURI(hash).slice(1));

    const scrollTo = (options: ScrollToOptions) => {
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo(options);
      } else {
        window.scrollTo(options.left ?? 0, options.top ?? 0);
      }
    };

    await raf(noop);

    if (scroll) {
      scrollTo({
        left: scroll.x,
        top: scroll.y,
        behavior: this.scrollBehaviour,
      });
    } else if (deepLinked) {
      const docRect = document.documentElement.getBoundingClientRect();
      const elRect = deepLinked.getBoundingClientRect();
      const offset = this.scrollOffset();
      const left = elRect.left - docRect.left - offset.left;
      const top = elRect.top - docRect.top - offset.top;
      scrollTo({ left, top, behavior: this.scrollBehaviour });
    } else {
      scrollTo({ left: 0, top: 0, behavior: this.scrollBehaviour });
    }
  }

  initListeners() {
    if ('scrollRestoration' in this.history) {
      this.history.scrollRestoration = 'manual';
    }

    // Adopted from Nuxt.js
    // Reset scrollRestoration to auto when leaving page, allowing page reload
    // and back-navigation from other pages to use the browser to restore the
    // scrolling position.
    addEventListener('beforeunload', () => {
      this.history.scrollRestoration = 'auto';
    });

    // Setting scrollRestoration to manual again when returning to this page.
    addEventListener('load', () => {
      this.history.scrollRestoration = 'manual';
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
          ...(this.history.state || {}),
          'vitebook:scroll': scrollState(),
        };
        this.history.replaceState(
          newState,
          document.title,
          window.location.href,
        );
      }, 50);
    });

    const hasPrefetched = new Set();
    const triggerPrefetch = (event: MouseEvent | TouchEvent) => {
      const a = findAnchor(event.target as Node | null);

      if (
        !a ||
        !a.href ||
        hasPrefetched.has(getHref(a)) ||
        !getHref(a).startsWith(getBaseUri(this.baseUrl)) ||
        !this.routes.has(decodeURI(getHrefURL(a).pathname))
      ) {
        return;
      }

      this.prefetch(getHrefURL(a));
      hasPrefetched.add(getHref(a));
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
      if (!this.enabled) return;

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
          this.scrollToPosition({ hash: location.hash });
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
      if (event.state && this.enabled) {
        const url = new URL(location.href);
        this.navigate({
          url,
          scroll: event.state['vitebook:scroll'],
        });
      }
    });
  }
}

function scrollState() {
  return {
    x: scrollX,
    y: scrollY,
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
    ? `https://ssr.com/${baseUrl}` // protocol/host irrelevant during SSR
    : `${location.protocol}//${location.host}${baseUrl === '/' ? '' : baseUrl}`;
}
