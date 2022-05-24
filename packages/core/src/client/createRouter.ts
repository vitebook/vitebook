import app from ':virtual/vitebook/app';

import {
  type AppContextMap,
  buildDataAssetUrl,
  type ClientLayoutModule,
  type ClientLoadedData,
  type ClientPage,
  type ClientPageModule,
  DATA_ASSET_URL_BASE,
  inBrowser,
  isLoadedMarkdownPage,
  type LoadedClientLayout,
  type LoadedClientPage,
} from '../shared';
import {
  getContext,
  PAGE_CTX_KEY,
  ROUTER_CTX_KEY,
  SERVER_CTX_KEY,
} from './context';
import { LRUMap } from './LRUMap.js';
import { createMemoryHistory } from './router/history/memory';
import { Router } from './router/Router';
import { layouts as pageLayouts } from './stores/layouts';
import { pages } from './stores/pages';
import { get } from './stores/store';
import type { ViewRenderer } from './view/ViewRenderer';

export async function createRouter({
  context,
  renderers,
}: {
  context: AppContextMap;
  renderers: ViewRenderer[];
}) {
  const target = inBrowser ? document.getElementById('app') : null;

  const router = new Router({
    target,
    context,
    baseUrl: app.baseUrl,
    history: inBrowser ? window.history : createMemoryHistory(),
  });

  context.set(ROUTER_CTX_KEY, router);

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
      loader: () => loadPage(router, _page),
      prefetch: async () => {
        await loadPage(router, _page, { prefetch: true });
      },
    });

    routes.push(_page.route);

    const page = getContext(router.context, PAGE_CTX_KEY);
    if (import.meta.hot && get(page)?.route === decodeURI(_page.route)) {
      loadPage(router, _page);
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
  router: Router,
  _page: ClientPage,
  { prefetch = false } = {},
): Promise<LoadedClientPage> {
  const [layouts, pageModule] = await Promise.all([
    loadPageLayouts(router, _page.layouts),
    _page.loader(),
  ]);

  const loadedPage: LoadedClientPage = {
    ..._page,
    $$loaded: true,
    module: pageModule,
    layouts,
    data: await loadData(router, _page.rootPath, pageModule),
    get default() {
      return pageModule.default;
    },
    get meta() {
      return isLoadedMarkdownPage(this) ? pageModule.meta : undefined;
    },
  };

  if (!prefetch) {
    const page = getContext(router.context, PAGE_CTX_KEY);
    page.__set(loadedPage);
  }

  return loadedPage;
}

export function loadPageLayouts(
  router: Router,
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
          data: await loadData(router, layout.rootPath, mod),
          get default() {
            return mod.default;
          },
        };
      }),
  );
}

// TODO: let's figure out a better number of entries because 100 is random. Probably best to
// let user configure this.
const dataCache = new LRUMap(100);

export async function loadData(
  router: Router,
  file: string,
  module: ClientPageModule | ClientLayoutModule,
): Promise<ClientLoadedData> {
  if (!module.loader) return {};

  const assetUrl = buildDataAssetUrl(file, router.url.pathname);

  if (import.meta.env.SSR) {
    const { data } = getContext(router.context, SERVER_CTX_KEY);
    return data.get(assetUrl) ?? {};
  }

  if (import.meta.env.PROD && dataCache.has(assetUrl)) {
    return dataCache.get(assetUrl)!;
  }

  try {
    const json = !router.started
      ? getDataFromScript(assetUrl)
      : await (await fetch(assetUrl)).json();

    dataCache.set(assetUrl, json);

    return json;
  } catch (e) {
    // TODO: handle this with error boundaries.
    console.error(e);
  }

  return {};
}

let dataScript: HTMLElement | null;
function getDataFromScript(assetUrl: string) {
  if (!dataScript) {
    dataScript = document.getElementById('__VBK_DATA__');
  }

  try {
    const content = JSON.parse(dataScript?.textContent ?? '{}');
    const key = assetUrl.replace(DATA_ASSET_URL_BASE, '');
    return content[key] ?? {};
  } catch (e) {
    if (import.meta.env.DEV) {
      //
    }
  }

  return {};
}
