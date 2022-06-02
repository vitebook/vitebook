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
  isBoolean,
  isLoadedMarkdownPage,
  isString,
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
import type { RouteDeclaration } from './router/types';
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

  if (inBrowser && import.meta.env.PROD) {
    // @ts-expect-error - .
    const redirects = window.__VBK_REDIRECTS_MAP__;
    for (const from of Object.keys(redirects)) {
      const to = redirects[from];
      router.addRedirect(from, to);
    }
  }

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

let routes: RouteDeclaration[] = [];

function addRoutes(router: Router, pages: Readonly<ClientPage[]>) {
  for (const page of pages) {
    const route: RouteDeclaration = {
      ...page.route,
      loader: async ({ redirect }) => {
        const pageOrRedirect = await loadPage(router, page);
        return isString(pageOrRedirect)
          ? redirect(pageOrRedirect)
          : pageOrRedirect;
      },
      prefetch: async ({ url, redirect }) => {
        const redirectTo = await loadPage(router, page, { prefetch: url });
        return isString(redirectTo) ? redirect(redirectTo) : undefined;
      },
    };

    router.addRoute(route);
    routes.push(route);
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

export async function loadPage(
  router: Router,
  page: ClientPage,
  { prefetch = false }: { prefetch?: boolean | URL } = {},
): Promise<string | LoadedClientPage> {
  const prefetchURL = isBoolean(prefetch) ? undefined : prefetch;

  let pageModule: ClientPageModule;
  let pageData: ClientLoadedData;
  let layouts: LoadedClientLayout[];

  /**
   * Loading is slightly different during dev because we need to check for a page redirect which
   * is returned from the `/assets/data` endpoint. This is not needed in prod because the
   * complete redirect table is injected into the rendered HTML.
   */
  if (import.meta.env.DEV) {
    pageModule = await page.loader();
    pageData = await loadData(router, pageModule, undefined, prefetchURL);

    if (import.meta.env.DEV && isString(pageData.__redirect__)) {
      return pageData.__redirect__;
    }

    layouts = await loadPageLayouts(router, page, prefetchURL);
  } else {
    [pageModule, layouts] = await Promise.all([
      (async () => {
        const mod = await page.loader();
        pageData = await loadData(router, mod, undefined, prefetchURL);
        return mod;
      })(),
      loadPageLayouts(router, page, prefetchURL),
    ]);
  }

  const loadedPage: LoadedClientPage = {
    ...page,
    $$loaded: true,
    module: pageModule,
    layouts,
    data: pageData!,
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
  prefetchURL?: URL,
): Promise<LoadedClientLayout[]> {
  const $pageLayouts = get(pageLayouts);

  return Promise.all(
    page.layouts.map(async (index) => {
      const layout = $pageLayouts[index];
      const mod = await layout.loader();
      return {
        $$loaded: true as const,
        ...layout,
        module: mod,
        data: await loadData(router, mod, index, prefetchURL),
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
  module: ClientPageModule | ClientLayoutModule,
  layoutIndex?: number,
  prefetchURL?: URL,
): Promise<ClientLoadedData> {
  if (!module.loader) return {};

  const pathname = prefetchURL?.pathname ?? get(router.navigation)!.to.pathname;

  const id = buildDataAssetID(decodeURI(pathname), layoutIndex);

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
