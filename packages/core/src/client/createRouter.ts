import app from ':virtual/vitebook/app';

import {
  type ClientPage,
  inBrowser,
  isLoadedMarkdownPage,
  type LoadedClientLayout,
  type LoadedClientPage,
} from '../shared';
import { routerContextKey } from './context';
import { createMemoryHistory } from './router/history/memory';
import { Router } from './router/Router';
import { layouts as pageLayouts } from './stores/layouts';
import { page } from './stores/page';
import { pages } from './stores/pages';
import { get } from './stores/store';
import type { ViewRenderer } from './view/ViewRenderer';

export async function createRouter({
  context = new Map<string, unknown>(),
  renderers = [] as ViewRenderer[],
}) {
  const target = inBrowser ? document.getElementById('app') : null;

  const router = new Router({
    target,
    context,
    baseUrl: app.baseUrl,
    history: inBrowser ? window.history : createMemoryHistory(),
  });

  context.set(routerContextKey, router);

  addRoutes(router, get(pages));

  await Promise.all(
    app.configs.map((config) => config({ context, router, renderers })),
  );

  handleHMR(router);

  if (inBrowser) {
    router.listen();
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

export async function loadPage(
  _page: ClientPage,
  { prefetch = false } = {},
): Promise<LoadedClientPage> {
  const [layouts, mod] = await Promise.all([
    loadPageLayouts(_page.layouts),
    _page.loader(),
  ]);

  const loadedPage: LoadedClientPage = {
    ..._page,
    $$loaded: true,
    module: mod,
    layouts,
    get default() {
      return mod.default;
    },
    get meta() {
      return isLoadedMarkdownPage(this) ? mod.meta : undefined;
    },
  };

  if (!prefetch) {
    page.__set(loadedPage);
  }

  return loadedPage;
}

export function loadPageLayouts(
  layouts: number[],
): Promise<LoadedClientLayout[]> {
  const $pageLayouts = get(pageLayouts);
  return Promise.all(
    layouts
      .map((i) => $pageLayouts[i])
      .map(async (layout) => {
        const mod = await layout.loader();
        return {
          $$loaded: true as const,
          ...layout,
          module: mod,
          get default() {
            return mod.default;
          },
        };
      }),
  );
}
