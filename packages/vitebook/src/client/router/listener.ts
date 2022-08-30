import type { Router } from './Router';
import { scrollPosition } from './scroll-delegate';

export function listen(router: Router, history: History) {
  if (import.meta.env.SSR) return;

  history.scrollRestoration = 'manual';

  // Adopted from Nuxt.js
  // Reset scrollRestoration to auto when leaving page, allowing page reload
  // and back-navigation from other pages to use the browser to restore the
  // scrolling position.
  addEventListener('beforeunload', () => {
    history.scrollRestoration = 'auto';
  });

  // Setting scrollRestoration to manual again when returning to this page.
  addEventListener('load', () => {
    history.scrollRestoration = 'manual';
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
      router.prefetch(getHref(a));
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
    if (router.disabled) return;

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
      router.hashChanged(hash);
      router.scroll.savePosition?.();
      return;
    }

    router._navigate(url, {
      scroll: !a.hasAttribute('data-noscroll') ? () => scrollPosition() : null,
      replace: url.href === location.href,
      keepfocus: false,
      accepted: () => event.preventDefault(),
      blocked: () => event.preventDefault(),
    });
  });

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      router.scroll.savePosition?.();
      router.scroll.commit?.();
    }
  });

  addEventListener('popstate', (event) => {
    if (!event.state || router.disabled) return;

    // If a popstate-driven navigation is cancelled, we need to counteract it with `history.go`,
    // which means we end up back here.
    if (event.state[router._historyKey] === router._historyIndex) return;

    router._navigate(new URL(location.href), {
      scroll: () => router.scroll.getSavedPosition?.(event.state),
      keepfocus: false,
      accepted: () => {
        router._historyIndex = event.state[router._historyKey];
      },
      blocked: () => {
        const delta = router._historyIndex - event.state[router._historyKey];
        history.go(delta);
      },
    });
  });

  addEventListener('hashchange', () => {
    // We need to update history if the `hashchange` happened as a result of clicking on a link,
    // otherwise we leave it alone.
    if (hashNavigation) {
      hashNavigation = false;
      history.replaceState(
        {
          ...history.state,
          [router._historyKey]: ++router._historyIndex,
        },
        '',
        location.href,
      );
    }
  });
}

function getHref(node: HTMLAnchorElement | SVGAElement) {
  return node instanceof SVGAElement
    ? new URL(node.href.baseVal, document.baseURI)
    : new URL(node.href);
}

function findAnchor(node: Node | null): HTMLAnchorElement | SVGAElement | null {
  while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; // SVG <a> elements have a lowercase name
  return node as HTMLAnchorElement | SVGAElement;
}
