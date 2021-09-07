import type { Page } from '@vitebook/core';
import { watch } from 'vue';
import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
  Router
} from 'vue-router';

import { usePages } from './composables/usePages';
import { useTheme } from './composables/useTheme';

export function createRouter(): Router {
  const theme = useTheme();
  const pages = usePages();

  const router = _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: []
  });

  // Should be overriden by theme.
  router.addRoute({
    path: '/',
    component: async () => 'Home'
  });

  router.addRoute({
    name: 'NotFound',
    path: '/:pathMatch(.*)*',
    component: theme.value.NotFound ?? (() => '404 Not Found')
  });

  addPageRoutes(router, pages.value);
  handleHMR(router);

  return router;
}

const pageRouteDisposal: (() => void)[] | undefined = import.meta.hot
  ? []
  : undefined;

function addPageRoutes(router: Router, pages: Page[]): void {
  pages.forEach((page) => {
    const dispose = router.addRoute({
      name: page.name,
      path: page.route,
      component: page.loader
    });

    pageRouteDisposal?.push(dispose);
  });
}

function handleHMR(router: Router): void {
  if (import.meta.hot) {
    const pages = usePages();

    watch(
      () => pages.value,
      (pages) => {
        pageRouteDisposal?.forEach((dispose) => dispose());
        addPageRoutes(router, pages);
      }
    );
  }
}
