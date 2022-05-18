import { isLoadedMarkdownPage } from '@vitebook/core';
import { tick } from 'svelte';
import { get } from 'svelte/store';

// @ts-expect-error - .
import { configureRouter } from ':virtual/vitebook/app';

import type { ClientPage, SvelteConstructor } from '../shared';
import DefaultNotFound from './components/DefaultNotFound.svelte';
import { createMemoryHistory } from './router/history/memory';
import { Router } from './router/router';
import { layouts as pageLayouts } from './stores/layouts';
import { page } from './stores/page';
import { pages } from './stores/pages';

export async function createRouter() {
  const router = new Router({
    baseUrl: '/',
    history: import.meta.env.SSR ? createMemoryHistory() : window.history,
  });

  addRoutes(router, get(pages));
  handleHMR(router);

  await configureRouter?.(router);

  if (!import.meta.env.SSR) {
    router.initListeners();
    await router.go(location.href, { replace: true });
  }

  return router;
}

let routes: string[] = [];

function addRoutes(router: Router, pages: Readonly<ClientPage[]>) {
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

  if (!router.hasRoute('/404.html')) {
    router.addRoute({
      path: '/404.html',
      loader: async () => DefaultNotFound,
    });
  }
}

function handleHMR(router: Router) {
  if (import.meta.hot) {
    const updatePages = (pages: ClientPage[]) => {
      routes.forEach((route) => router.removeRoute(route));
      routes = [];
      addRoutes(router, pages);
    };

    let pagesUpdateTimer;
    const delayedPagesUpdate = (pages: ClientPage[]) => {
      clearTimeout(pagesUpdateTimer);
      pagesUpdateTimer = setTimeout(() => updatePages(pages), 100);
    };

    pages.subscribe(($pages) => delayedPagesUpdate($pages));
    pageLayouts.subscribe(() => delayedPagesUpdate(get(pages)));
  }
}

async function loadPage(
  _page: ClientPage,
  { prefetch = false } = {},
): Promise<SvelteConstructor> {
  const mod = await _page.loader();
  const component = mod.default;

  const $pageLayouts = get(pageLayouts);
  const layouts = await Promise.all(
    _page.layouts
      .map((i) => $pageLayouts[i])
      .map(async (layout) => {
        const mod = await layout.loader();
        return {
          $$loaded: true as const,
          ...layout,
          module: mod,
          get component() {
            return mod.default;
          },
        };
      }),
  );

  if (!prefetch) {
    page.__set({
      ..._page,
      $$loaded: true,
      module: mod,
      layouts,
      get component() {
        return mod.default;
      },
      get meta() {
        return isLoadedMarkdownPage(this) ? mod.meta : undefined;
      },
    });
  }

  await tick();

  return component;
}
