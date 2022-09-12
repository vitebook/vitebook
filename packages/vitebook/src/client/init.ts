import { installURLPattern } from 'shared/polyfills';

import app from ':virtual/vitebook/app';
import manifest from ':virtual/vitebook/manifest';

import { type Reactive, Router } from './router';
import type {
  ClientManifest,
  ClientRoute,
  LoadedClientRoute,
  Navigation,
} from './router/types';
import { isMarkdownModule } from './utils';

export type ClientInitOptions = {
  $route: Reactive<LoadedClientRoute>;
  $navigation: Reactive<Navigation>;
};

export async function init({ $route, $navigation }: ClientInitOptions) {
  await installURLPattern();

  const router = new Router({
    baseUrl: app.baseUrl,
    trailingSlash: window['__VBK_TRAILING_SLASH__'],
    $route,
    $navigation,
  });

  if (import.meta.env.PROD) {
    const redirects = window['__VBK_STATIC_REDIRECTS_MAP__'] ?? {};
    for (const from of Object.keys(redirects)) {
      const to = redirects[from];
      router.addRedirect(from, to);
    }
  }

  readManifest(router, manifest);

  if (import.meta.hot) {
    import.meta.hot.on('vitebook::md_meta', ({ filePath, meta }) => {
      const route = $route.get();
      if (
        isMarkdownModule(route.module.module) &&
        filePath.endsWith(route.id)
      ) {
        $route.set({
          ...route,
          module: {
            ...route.module,
            module: {
              ...route.module.module,
              __markdownMeta: meta,
            },
          },
        });
      }
    });

    $route.subscribe((route) => {
      import.meta.hot!.send('vitebook::route_change', {
        id: route?.id ?? '',
      });
    });

    import.meta.hot.accept('/:virtual/vitebook/manifest', (mod) => {
      handleManifestChange(router, mod?.default);
    });
  }

  return router;
}

const routeIds = new Set<string | symbol>();

function readManifest(
  router: Router,
  { paths, loaders, fetch, routes }: ClientManifest,
) {
  const clientRoutes: ClientRoute[] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const pathname = paths[route.p][0];

    clientRoutes.push({
      id: route.i ?? Symbol(),
      pathname,
      pattern: new URLPattern({ pathname }),
      score: paths[route.p][1],
      fetch: fetch.includes(route.m),
      loader: loaders[route.m],
      layout: !!route.l,
      error: !!route.e,
    });

    if (import.meta.hot) routeIds.add(route.i!);
  }

  router._addAll(clientRoutes);
}

function handleManifestChange(router: Router, manifest?: ClientManifest) {
  if (import.meta.hot) {
    for (const id of routeIds) {
      router.remove(id);
      routeIds.delete(id);
    }

    if (manifest) readManifest(router, manifest);
  }
}
