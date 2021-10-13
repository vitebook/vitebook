import { inBrowser, isFunction } from '@vitebook/core/shared';
import { SvelteComponent, tick } from 'svelte';
import { get } from 'svelte/store';

import type { ClientPage, LoadedClientPage } from '../shared';
import DefaultNotFound from './components/DefaultNotFound.svelte';
import { createMemoryHistory } from './router/history/memory';
import { Router } from './router/router';
import { currentPage } from './stores/currentPage';
import { pages } from './stores/pages';
import { siteOptions } from './stores/siteOptions';
import { theme } from './stores/theme';

export async function createRouter() {
  const router = new Router({
    baseUrl: get(siteOptions).baseUrl,
    history: import.meta.env.SSR ? createMemoryHistory() : window.history
  });

  addRoutes(router, get(pages));
  handleHMR(router);

  get(theme).configureRouter?.(router);

  if (!router.hasRoute('/404.html')) {
    router.addRoute({
      path: '/404.html',
      loader: async () => get(theme).NotFound ?? DefaultNotFound
    });
  }

  if (!router.hasRoute('/') && get(theme).explorer !== false) {
    router.addRoute({
      path: '/',
      loader: async () =>
        (await import('./components/Explorer/Explorer.svelte')).default
    });
  }

  if (inBrowser) {
    await router.go(location.href, { replace: true });
    router.initListeners();
  }

  return router;
}

let routes: string[] = [];

// Memory usage concern for larger projects?
let loadedPageCache = new WeakMap<ClientPage, LoadedClientPage>();

function addRoutes(router: Router, pages: Readonly<ClientPage[]>) {
  pages.forEach((page) => {
    router.addRoute({
      path: page.route,
      loader: () => loadPage(page),
      prefetch: async () => {
        await loadPage(page, { prefetch: true });
      }
    });

    routes.push(page.route);

    if (import.meta.hot && get(currentPage)?.route === page.route) {
      loadPage(page); // load new page meta
    }
  });
}

function handleHMR(router: Router) {
  if (import.meta.hot) {
    siteOptions.subscribe((site) => {
      router.baseUrl = site.baseUrl;
      router.go(location.href, { replace: true });
    });

    pages.subscribe(async (pages) => {
      loadedPageCache = new WeakMap();
      routes.forEach((route) => router.removeRoute(route));
      routes = [];
      addRoutes(router, pages);
    });
  }
}

async function loadPage(
  page: ClientPage,
  { prefetch = false } = {}
): Promise<typeof SvelteComponent> {
  if (loadedPageCache.has(page)) {
    const loadedPage = loadedPageCache.get(page)!;
    if (!prefetch) currentPage.__set(loadedPage);
    return loadedPage.module.default;
  }

  const mod = await page.loader();

  const component = mod.default;

  const meta = isFunction(mod.__pageMeta)
    ? await mod.__pageMeta(page, mod)
    : mod.__pageMeta;

  const loadedPage = {
    ...page,
    module: mod,
    meta: meta ?? {}
  } as LoadedClientPage;

  if (loadedPage) loadedPageCache.set(page, loadedPage);

  if (!prefetch) currentPage.__set(loadedPage);

  await tick();

  return component;
}
