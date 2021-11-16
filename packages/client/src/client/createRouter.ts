import { inBrowser, isFunction } from '@vitebook/core';
import { tick } from 'svelte';
import { get } from 'svelte/store';

import type {
  ClientPage,
  LoadedClientPage,
  SvelteConstructor,
} from '../shared';
import DefaultNotFound from './components/DefaultNotFound.svelte';
import { createMemoryHistory } from './router/history/memory';
import { Router } from './router/router';
import { currentPage } from './stores/currentPage';
import { currentRoute } from './stores/currentRoute';
import { pages } from './stores/pages';
import { siteOptions } from './stores/siteOptions';
import { theme } from './stores/theme';

export async function createRouter() {
  const router = new Router({
    baseUrl: get(siteOptions).baseUrl,
    history: import.meta.env.SSR ? createMemoryHistory() : window.history,
  });

  addRoutes(router, get(pages));
  handleHMR(router);

  await get(theme).configureRouter?.(router);

  if (!router.hasRoute('/404.html')) {
    router.addRoute({
      path: '/404.html',
      loader: async () => get(theme).NotFound ?? DefaultNotFound,
    });
  }

  if (!router.hasRoute('/')) {
    // TODO: add welcome page.
  }

  if (inBrowser) {
    router.initListeners();
    await router.go(location.href, { replace: true });
  }

  return router;
}

let routes: string[] = [];

function addRoutes(router: Router, pages: Readonly<ClientPage[]>) {
  pages.forEach((page) => {
    router.addRoute({
      path: page.route,
      loader: () => loadPage(page),
      prefetch: async () => {
        await loadPage(page, { prefetch: true });
      },
    });

    routes.push(page.route);

    if (import.meta.hot && get(currentPage)?.route === decodeURI(page.route)) {
      loadPage(page); // load new page meta
    }
  });
}

function handleHMR(router: Router) {
  if (import.meta.hot) {
    let prevBaseUrl = '/';

    siteOptions.subscribe((site) => {
      // Only after init.
      if (get(currentRoute) && site.baseUrl !== prevBaseUrl) {
        router.baseUrl = site.baseUrl;
        router.go(location.href, { replace: true });
        prevBaseUrl = site.baseUrl;
      }
    });

    const updatePages = (pages: ClientPage[]) => {
      routes.forEach((route) => router.removeRoute(route));
      routes = [];
      addRoutes(router, pages);
    };

    let pagesUpdateTimer;
    pages.subscribe(async (pages) => {
      clearTimeout(pagesUpdateTimer);
      pagesUpdateTimer = setTimeout(() => updatePages(pages), 100);
    });
  }
}

// Memory usage concern for larger projects?
const loadedPageCache = new WeakMap<ClientPage, LoadedClientPage>();

async function loadPage(
  page: ClientPage,
  { prefetch = false } = {},
): Promise<SvelteConstructor> {
  if (import.meta.env.PROD) {
    if (loadedPageCache.has(page)) {
      const loadedPage = loadedPageCache.get(page)!;
      if (!prefetch) currentPage.__set(loadedPage);
      return loadedPage.module.default;
    }
  }

  const mod = await page.loader();
  const component = mod.default;
  const pageMeta = mod.__pageMeta ?? {};
  const meta = isFunction(pageMeta) ? await pageMeta(page, mod) : pageMeta;

  const loadedPage = {
    ...page,
    module: mod,
    meta: meta ?? {},
  } as LoadedClientPage;

  if (import.meta.env.PROD) {
    if (loadedPage) loadedPageCache.set(page, loadedPage);
  }

  if (!prefetch) currentPage.__set(loadedPage);

  await tick();

  return component;
}
