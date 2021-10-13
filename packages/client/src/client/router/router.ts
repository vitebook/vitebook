import { ensureLeadingSlash, inBrowser, isString } from '@vitebook/core/shared';
import { tick } from 'svelte';

import { currentPage } from '../stores/currentPage';
import { currentRoute } from '../stores/currentRoute';
import type {
  NavigationOptions,
  Route,
  RouteLocation,
  RouterOptions
} from './types';

/**
 * Adapted from https://github.com/sveltejs/kit/blob/master/packages/kit/src/runtime/client/router.js
 */
export class Router {
  protected readonly history: History;
  protected readonly routes: Map<string, Route> = new Map();

  enabled = true;
  baseUrl: string;
  scrollYOffset = () => 0;
  beforeNavigate?: (url: URL) => void | Promise<void>;
  afterNavigate?: (url: URL) => void | Promise<void>;

  protected resolveReady?: (value?: unknown) => void;
  protected _isReady = new Promise((res) => (this.resolveReady = res));

  get isReady() {
    return this._isReady;
  }

  constructor({ baseUrl, history, routes }: RouterOptions) {
    this.baseUrl = baseUrl;
    this.history = history;

    routes?.forEach((route) => {
      this.routes.set(route.path, route);
    });

    if (inBrowser) {
      // make it possible to reset focus
      document.body.setAttribute('tabindex', '-1');

      // create initial history entry, so we can return here
      this.history.replaceState(this.history.state || {}, '', location.href);
    }
  }

  hasRoute(path: string) {
    return this.routes.has(path);
  }

  addRoute(route: Route) {
    this.routes.set(route.path, route);
  }

  removeRoute(route: string | Route) {
    this.routes.delete(isString(route) ? route : route.path);
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
        url.pathname.slice(this.baseUrl.length) || '/'
      );
      const decodedPath = decodeURI(path);
      const route =
        this.routes.get(decodedPath) ?? this.routes.get('/404.html')!;
      const query = new URLSearchParams(url.search);
      const id = `${path}?${query}`;
      return { id, route, path, query, hash: url.hash };
    }

    return undefined;
  }

  async go(
    href,
    { noscroll = false, replace = false, keepfocus = false, state = {} } = {}
  ) {
    const baseUri = import.meta.env.SSR
      ? `https://ssr.com/${this.baseUrl}` // protocol/host irrelevant during SSR
      : `${location.protocol}//${location.host}${
          this.baseUrl === '/' ? '' : this.baseUrl
        }`;

    const url = new URL(href, baseUri);

    await this.beforeNavigate?.(url);

    if (this.enabled && this.owns(url)) {
      this.history[replace ? 'replaceState' : 'pushState'](state, '', href);

      await this.navigate({
        url,
        scroll: noscroll ? scrollState() : undefined,
        keepfocus,
        hash: url.hash
      });

      if (this.resolveReady) {
        this.resolveReady();
        this.resolveReady = undefined;
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

    if (!routeLocation) {
      throw new Error(
        'Attempted to prefetch a URL that does not belong to this app'
      );
    }

    await routeLocation.route.prefetch?.(routeLocation);
  }

  protected async navigate({
    url,
    keepfocus,
    scroll,
    hash
  }: NavigationOptions) {
    currentPage.__set(undefined);

    const routeLocation = this.parse(url);

    if (!routeLocation) {
      throw new Error(
        'Attempted to navigate to a URL that does not belong to this app'
      );
    }

    const component = await routeLocation.route.loader(routeLocation);

    currentRoute.__set({
      ...routeLocation,
      component
    });

    await tick();

    if (inBrowser) {
      if (!keepfocus) {
        document.body.focus();
      }

      const deepLinked = hash && document.getElementById(hash.slice(1));
      if (scroll) {
        scrollTo(scroll.x, scroll.y + this.scrollYOffset());
      } else if (deepLinked) {
        scrollTo(0, deepLinked.offsetTop + this.scrollYOffset());
      } else {
        scrollTo(0, this.scrollYOffset());
      }
    }

    await this.afterNavigate?.(url);
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
          'vitebook:scroll': scrollState()
        };
        this.history.replaceState(
          newState,
          document.title,
          window.location.href
        );
      }, 50);
    });

    const triggerPrefetch = (event: MouseEvent | TouchEvent) => {
      const a = findAnchor(event.target as Node | null);
      if (a && a.href && this.routes.has(getHref(a).pathname)) {
        this.prefetch(getHref(a));
      }
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

      const url = getHref(a);
      const urlString = url.toString();

      if (urlString === location.href) {
        if (!location.hash) event.preventDefault();
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

      const noscroll = a.hasAttribute('vitebook:noscroll');

      const i1 = urlString.indexOf('#');
      const i2 = location.href.indexOf('#');
      const u1 = i1 >= 0 ? urlString.substring(0, i1) : urlString;
      const u2 = i2 >= 0 ? location.href.substring(0, i2) : location.href;

      this.history.pushState({}, '', url.href);

      if (u1 === u2) {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }

      this.navigate({
        url,
        scroll: noscroll ? scrollState() : undefined,
        hash: url.hash
      });

      event.preventDefault();
    });

    addEventListener('popstate', (event) => {
      if (event.state && this.enabled) {
        const url = new URL(location.href);
        this.navigate({
          url,
          scroll: event.state['vitebook:scroll']
        });
      }
    });
  }
}

function scrollState() {
  return {
    x: scrollX,
    y: scrollY
  };
}

function findAnchor(node: Node | null): HTMLAnchorElement | SVGAElement | null {
  while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; // SVG <a> elements have a lowercase name
  return node as HTMLAnchorElement | SVGAElement;
}

function getHref(node: HTMLAnchorElement | SVGAElement): URL {
  return node instanceof SVGAElement
    ? new URL(node.href.baseVal, document.baseURI)
    : new URL(node.href);
}
