import type {
  LoadedRoute,
  RouteDeclaration,
  RouteNavigation,
  Router,
} from 'router';
import { createMemoryHistory, createRouter } from 'router';
import type { Reactive } from 'router/reactivity';
import type { JSONData, ServerEntryContext } from 'server/types';
import {
  resolveStaticDataAssetID,
  STATIC_DATA_ASSET_BASE_PATH,
} from 'shared/data';
import { isBoolean, isString } from 'shared/utils/unit';

import app from ':virtual/vitebook/app';

import type {
  ClientLayout,
  ClientLayoutModule,
  ClientPage,
  ClientPageModule,
  LoadedClientLayout,
  LoadedClientMarkdownPage,
  LoadedClientPage,
} from './types';
import { isLoadedMarkdownPage } from './utils';

export type RouterInitOptions = {
  $route: Reactive<LoadedRoute>;
  $navigation: Reactive<RouteNavigation>;
  $pages: Reactive<ClientPage[]>;
  $layouts: Reactive<ClientLayout[]>;
  $currentPage: Reactive<LoadedClientPage>;
  serverContext?: ServerEntryContext;
};

export async function initRouter({
  $route,
  $navigation,
  $pages,
  $layouts,
  $currentPage,
  serverContext,
}: RouterInitOptions) {
  const router = createRouter({
    baseUrl: app.baseUrl,
    trailingSlash: !import.meta.env.SSR
      ? window['__VBK_TRAILING_SLASH__']
      : true,
    history: !import.meta.env.SSR ? window.history : createMemoryHistory(),
    $route,
    $navigation,
    serverContext,
  });

  if (!import.meta.env.SSR && import.meta.env.PROD) {
    const redirects = window['__VBK_STATIC_REDIRECTS_MAP__'] ?? {};
    for (const from of Object.keys(redirects)) {
      const to = redirects[from];
      router.addRedirect(from, to);
    }
  }

  await Promise.all(app.configs.map((config) => config?.({ router })));

  addRoutes(router, $pages.get(), $layouts.get(), $currentPage);

  if (import.meta.hot) {
    handlePageHMR($currentPage);
    handlePagesHMR(router, $pages, $layouts, $currentPage);
  }

  return router;
}

let routes: RouteDeclaration[] = [];

function addRoutes(
  router: Router,
  pages: ClientPage[],
  layouts: ClientLayout[],
  $currentPage: Reactive<LoadedClientPage>,
) {
  for (const page of pages) {
    const route: RouteDeclaration = {
      ...page.route,
      loader: async ({ redirect }) => {
        const pageOrRedirect = await loadPage(
          router,
          page,
          layouts,
          $currentPage,
        );

        return isString(pageOrRedirect)
          ? redirect(pageOrRedirect)
          : pageOrRedirect;
      },
      prefetch: async ({ url, redirect }) => {
        const redirectTo = await loadPage(router, page, layouts, $currentPage, {
          prefetch: url,
        });

        return isString(redirectTo) ? redirect(redirectTo) : undefined;
      },
    };

    router.addRoute(route);
    routes.push(route);
  }
}

function handlePageHMR($currentPage: Reactive<LoadedClientPage>) {
  if (import.meta.hot) {
    import.meta.hot.on('vitebook::md_meta', ({ filePath, meta }) => {
      const page = $currentPage.get();
      if (isLoadedMarkdownPage(page) && filePath.endsWith(page.rootPath)) {
        $currentPage.set({ ...page, meta } as LoadedClientMarkdownPage);
      }
    });

    $currentPage.subscribe(($page) => {
      import.meta.hot!.send('vitebook::page_change', {
        rootPath: $page?.rootPath ?? '',
      });
    });
  }
}

function handlePagesHMR(
  router: Router,
  $pages: Reactive<ClientPage[]>,
  $layouts: Reactive<ClientLayout[]>,
  $currentPage: Reactive<LoadedClientPage>,
) {
  if (import.meta.hot) {
    const updatePages = (pages: ClientPage[]) => {
      routes.forEach((route) => router.removeRoute(route));
      routes = [];
      addRoutes(router, pages, $layouts.get(), $currentPage);
    };

    let pagesUpdateTimer;
    const delayedPagesUpdate = (pages: ClientPage[]) => {
      clearTimeout(pagesUpdateTimer);
      pagesUpdateTimer = setTimeout(() => updatePages(pages), 100);
    };

    $pages.subscribe(($pages) => delayedPagesUpdate($pages));
    $layouts.subscribe(() => delayedPagesUpdate($pages.get()));
  }
}

export async function loadPage(
  router: Router,
  clientPage: ClientPage,
  clientLayouts: ClientLayout[],
  $currentPage: Reactive<LoadedClientPage>,
  { prefetch = false }: { prefetch?: boolean | URL } = {},
): Promise<string | LoadedClientPage> {
  const prefetchURL = isBoolean(prefetch) ? undefined : prefetch;

  let pageModule: ClientPageModule;
  let pageStaticData: JSONData;
  let layouts: LoadedClientLayout[];

  /**
   * Loading is slightly different during dev because we need to check for a page redirect which
   * is returned from the `/_immutable/data` endpoint. This is not needed in prod because the
   * complete redirect table is injected into the rendered HTML.
   */
  if (import.meta.env.DEV) {
    pageModule = await clientPage.loader();

    pageStaticData = await loadStaticData(
      router,
      pageModule,
      undefined,
      prefetchURL,
    );

    if (import.meta.env.DEV && isString(pageStaticData.__redirect__)) {
      return pageStaticData.__redirect__;
    }

    layouts = await loadPageLayouts(
      router,
      clientPage,
      clientLayouts,
      prefetchURL,
    );
  } else {
    [pageModule, layouts] = await Promise.all([
      (async () => {
        const mod = await clientPage.loader();
        pageStaticData = await loadStaticData(
          router,
          mod,
          undefined,
          prefetchURL,
        );
        return mod;
      })(),
      loadPageLayouts(router, clientPage, clientLayouts, prefetchURL),
    ]);
  }

  const loadedPage: LoadedClientPage = {
    ...clientPage,
    $$loaded: true,
    module: pageModule,
    layouts,
    staticData: pageStaticData!,
    get default() {
      return pageModule.default;
    },
    get meta() {
      return isLoadedMarkdownPage(this) ? pageModule.meta : undefined;
    },
  };

  if (!prefetch) {
    $currentPage.set(loadedPage);
  }

  return loadedPage;
}

export function loadPageLayouts(
  router: Router,
  page: ClientPage,
  layouts: ClientLayout[],
  prefetchURL?: URL,
): Promise<LoadedClientLayout[]> {
  return Promise.all(
    page.layouts.map(async (index) => {
      const layout = layouts[index];
      const mod = await layout.loader();
      return {
        $$loaded: true as const,
        ...layout,
        module: mod,
        staticData: await loadStaticData(router, mod, index, prefetchURL),
        get default() {
          return mod.default;
        },
      };
    }),
  );
}

export async function loadStaticData(
  router: Router,
  module: ClientPageModule | ClientLayoutModule,
  layoutIndex?: number,
  prefetchURL?: URL,
): Promise<JSONData> {
  if (!module.loader) return {};

  let pathname = prefetchURL?.pathname ?? router.navigation.get()!.to.pathname;
  if (!pathname.endsWith('/')) pathname += '/';

  const id = resolveStaticDataAssetID(decodeURI(pathname), layoutIndex);

  const hashId =
    import.meta.env.PROD && !import.meta.env.SSR
      ? window['__VBK_STATIC_DATA_HASH_MAP__'][await hashDataId(id)]
      : id;

  if (!hashId) return {};

  if (import.meta.env.SSR && router.serverContext) {
    return router.serverContext.staticData.get(hashId) ?? {};
  }

  try {
    const json = !router.started
      ? getStaticDataFromScript(hashId)
      : await (
          await fetch(`${STATIC_DATA_ASSET_BASE_PATH}/${hashId}.json`)
        ).json();

    return json;
  } catch (e) {
    // TODO: handle this with error boundaries?
    console.error(e);
  }

  return {};
}

function getStaticDataFromScript(id: string) {
  return window['__VBK_STATIC_DATA__']?.[id] ?? {};
}

// Used in production to hash data id.
async function hashDataId(id: string) {
  const encodedText = new TextEncoder().encode(id);
  const hashBuffer = await crypto.subtle.digest('SHA-1', encodedText);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 8);
}
