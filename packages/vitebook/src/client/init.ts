import { installURLPattern } from 'shared/polyfills';

import app from ':virtual/vitebook/app';
import routes from ':virtual/vitebook/routes';

import { type Reactive, Router } from './router';
import type { LoadedRoute, RouteTransition } from './router/types';
import { isMarkdownModule } from './utils';

export type ClientInitOptions = {
  $route: Reactive<LoadedRoute>;
  $transition: Reactive<RouteTransition>;
};

export async function init({ $route, $transition }: ClientInitOptions) {
  await installURLPattern();

  const router = new Router({
    baseUrl: app.baseUrl,
    trailingSlash: window['__VBK_TRAILING_SLASH__'],
    $route,
    $transition,
  });

  if (import.meta.env.PROD) {
    const redirects = window['__VBK_STATIC_REDIRECTS_MAP__'] ?? {};
    for (const from of Object.keys(redirects)) {
      const to = redirects[from];
      router.addRedirect(from, to);
    }
  }

  // Add routes.
  for (let i = 0; i < routes.length; i++) router.add(routes[i]);

  if (import.meta.hot) {
    import.meta.hot.on('vitebook::md_meta', ({ filePath, meta }) => {
      const route = $route.get();
      if (isMarkdownModule(route.module) && filePath.endsWith(route.id)) {
        $route.set({
          ...route,
          module: {
            ...route.module,
            __markdownMeta: meta,
          },
        });
      }
    });

    $route.subscribe((route) => {
      import.meta.hot!.send('vitebook::route_change', {
        rootPath: route?.id ?? '',
      });
    });

    let prevRoutes = routes;
    import.meta.hot.accept('/:virtual/vitebook/routes', (mod) => {
      if (prevRoutes) {
        for (let i = 0; i < prevRoutes.length; i++) {
          router.remove(prevRoutes[i].id!);
        }
      }

      const newRoutes = mod?.default;
      if (newRoutes) {
        for (let i = 0; i < newRoutes.length; i++) router.add(newRoutes[i]);
      }

      prevRoutes = newRoutes;
    });
  }

  return router;
}
