import app from ':virtual/vitebook/app';

import {
  type AppContextMap,
  buildDataAssetID,
  type ClientLayoutModule,
  type ClientLoadedData,
  type ClientPage,
  type ClientPageModule,
  DATA_ASSET_BASE_URL,
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
  page: ClientPage,
  { prefetch = false } = {},
): Promise<LoadedClientPage> {
  const [layouts, pageModule] = await Promise.all([
    loadPageLayouts(router, page, page.layouts),
    page.loader(),
  ]);

  const loadedPage: LoadedClientPage = {
    ...page,
    $$loaded: true,
    module: pageModule,
    layouts,
    data: await loadData(router, page, page.rootPath, pageModule),
    get default() {
      return pageModule.default;
    },
    get meta() {
      return isLoadedMarkdownPage(this) ? pageModule.meta : undefined;
    },
  };

  if (!prefetch) {
    const store = getContext(router.context, PAGE_CTX_KEY);
    store.__set(loadedPage);
  }

  return loadedPage;
}

export function loadPageLayouts(
  router: Router,
  page: ClientPage,
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
          data: await loadData(router, page, layout.rootPath, mod),
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
  page: ClientPage,
  file: string,
  module: ClientPageModule | ClientLayoutModule,
): Promise<ClientLoadedData> {
  if (!module.loader) return {};

  const id = buildDataAssetID(
    file,
    import.meta.env.SSR ? router.url.pathname : page.route,
  );

  const hashId =
    import.meta.env.PROD && !import.meta.env.SSR
      ? // @ts-expect-error - .
        window.__VBK_DATA_HASH_MAP__[id]
      : id;

  if (!hashId) return {};

  if (import.meta.env.SSR) {
    const { data } = getContext(router.context, SERVER_CTX_KEY);
    return data.get(hashId) ?? {};
  }

  if (import.meta.env.PROD && dataCache.has(hashId)) {
    return dataCache.get(hashId)!;
  }

  try {
    const json = !router.started
      ? getDataFromScript(hashId)
      : await (await fetch(`${DATA_ASSET_BASE_URL}/${hashId}.json`)).json();

    dataCache.set(hashId, json);

    return json;
  } catch (e) {
    // TODO: handle this with error boundaries.
    console.error(e);
  }

  return {};
}

function getDataFromScript(id: string) {
  const dataScript = document.getElementById('__VBK_DATA__');

  try {
    const content = JSON.parse(dataScript!.textContent!);
    return content[id] ?? {};
  } catch (e) {
    if (import.meta.env.DEV) {
      //
    }
  }

  return {};
}
