import { tick } from 'svelte';
import { get } from 'svelte/store';

// @ts-expect-error - .
import * as App from ':virtual/vitebook/app';

import { Page, Pages, SvelteConstructor } from '../shared';
import DefaultNotFound from './components/DefaultNotFound.svelte';
import { createMemoryHistory } from './router/history/memory';
import { Router } from './router/router';
import { page } from './stores/page';
import { pages } from './stores/pages';

export async function createRouter() {
  const router = new Router({
    baseUrl: '/',
    history: import.meta.env.SSR ? createMemoryHistory() : window.history,
  });

  addRoutes(router, get(pages));
  handleHMR(router);

  await App.configureRouter?.(router);

  if (!router.hasRoute('/404.html')) {
    router.addRoute({
      path: '/404.html',
      loader: async () => DefaultNotFound,
    });
  }

  if (!import.meta.env.SSR) {
    router.initListeners();
    await router.go(location.href, { replace: true });
  }

  return router;
}

let routes: string[] = [];

function addRoutes(router: Router, pages: Readonly<Pages>) {
  pages.forEach((_page) => {
    router.addRoute({
      path: _page.route,
      loader: () => loadPage(_page),
      prefetch: async () => {
        await loadPage(_page, { prefetch: true });
      },
    });

    routes.push(_page.route);

    if (import.meta.hot && get(page)?.route === decodeURI(_page.route)) {
      loadPage(_page);
    }
  });
}

function handleHMR(router: Router) {
  if (import.meta.hot) {
    const updatePages = (pages: Pages) => {
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

async function loadPage(
  _page: Page,
  { prefetch = false } = {},
): Promise<SvelteConstructor> {
  const mod = await _page.loader();
  const component = mod.default;

  if (!prefetch) {
    page.__set({
      ..._page,
      mod,
      component,
    });
  }

  await tick();

  return component;
}
